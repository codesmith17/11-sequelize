const path = require("path");
const mongodb = require("mongodb");
const { get } = require("http");
const { getDb } = require(path.join(__dirname, "..", "utils", "database.js"));

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.cart = cart;
        this._id = id;
        this.email = email;
    }
    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db.collection('users')
                .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
        } else {
            dbOp = db
                .collection('users')
                .insertOne(this);
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }

    addToCart(product) {
        if (!this.cart || !this.cart.items) {
            this.cart = { items: [] }; // Initialize cart if it's undefined
        }
        if (!this.cart.totalPrice) {
            this.cart.totalPrice = 0;
        }

        const newQuantity = 1;
        const currentItems = this.cart.items;

        // Ensure that product is defined before accessing its properties
        if (!product || !product._id) {
            throw new Error('Invalid product provided');
        }

        // Check if the product already exists in the cart
        let existingProduct = currentItems.find(item => item.productId.toString() === product._id.toString());

        if (existingProduct) {
            // If product exists, update its quantity
            existingProduct.quantity += newQuantity;
        } else {
            // If product doesn't exist, add it to the cart
            currentItems.push({
                productId: product._id,
                quantity: newQuantity
            });
        }

        let totalPrice = this.cart.totalPrice;

        const db = getDb();

        // Retrieve the price of each product from the database
        db.collection('products')
            .findOne({ _id: new mongodb.ObjectId(product._id) })
            .then(foundProduct => {
                if (foundProduct) {
                    const productPrice = foundProduct.price;
                    totalPrice += productPrice;
                    this.cart.totalPrice = totalPrice;

                    // Update the cart in the database
                    return db.collection('users')
                        .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } });
                }
            })
            .catch(err => console.log(err));
    }


    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => item.productId);
        // console.log(productIds);
        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                const cartResult = products.map(product => {
                    return {...product,
                        quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString())
                    };

                });
                // console.log(cartResult);
                return cartResult;
            })
            .catch(err => console.log(err));
    }

    cartDelete(productId) {
        const db = getDb();
        let currentItems = this.cart.items;
        currentItems = currentItems.filter(item => item.productId.toString() !== productId);

        return db.collection('products')
            .findOne({ _id: new mongodb.ObjectId(productId) })
            .then(product => {
                const productPrice = product.price;
                const totalPrice = currentItems.reduce((acc, item) => {
                    return acc + (item.quantity * productPrice);
                }, 0);

                return db.collection('users')
                    .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: currentItems, totalPrice: totalPrice } } });
            })
            .catch(err => console.log(err));
    }

    incrementCart(productId) {
        const db = getDb();
        let currentItems = this.cart.items;
        let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

        if (existingProductIndex !== -1) {
            const currentQuantity = currentItems[existingProductIndex].quantity;
            currentItems[existingProductIndex].quantity = currentQuantity + 1;

            return db.collection('products')
                .findOne({ _id: new mongodb.ObjectId(productId) })
                .then(product => {
                    let productPrice = product.price;
                    this.cart.totalPrice += productPrice;
                    db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: this.cart } });
                })
                .catch(err => console.log(err));
        } else {
            console.log("Product not found in cart.");
            return Promise.resolve();
        }
    }


    decrementCart(productId) {
        const db = getDb();
        let currentItems = this.cart.items;
        let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

        if (existingProductIndex !== -1) {
            const currentQuantity = currentItems[existingProductIndex].quantity;

            // Decrement the quantity
            currentItems[existingProductIndex].quantity = Math.max(0, currentQuantity - 1);

            // If quantity becomes 0, remove the item from the array
            if (currentItems[existingProductIndex].quantity === 0) {
                currentItems.splice(existingProductIndex, 1);
            }

            // Update the cart in the database
            return db.collection('products')
                .findOne({ _id: new mongodb.ObjectId(productId) })
                .then(product => {
                    let productPrice = product.price;
                    this.cart.totalPrice -= productPrice;

                    // Construct an updated cart object with the modified items array
                    const updatedCart = {
                        items: currentItems,
                        totalPrice: this.cart.totalPrice
                    };

                    return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
                })
                .catch(err => console.log(err));
        } else {
            console.log("Product not found in cart.");
            return Promise.resolve();
        }
    }










    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .find({ _id: new mongodb.ObjectId(userId) })
            .next()
            .then(user => { return user; })
            .catch(err => console.log(err))


    }
    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(product => {
                const order = {
                    items: product,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name
                    }
                };
                return db.collection('orders').insertOne(order);
            })
            .then(result => {
                this.cart = { items: [], totalPrice: 0 };
                return db.collection('users')
                    .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } })
            });

    }

}

module.exports = { User }