const mongoose = require("mongoose");
const path = require("path")
const Schema = mongoose.Schema;
const Product = require(path.join(__dirname, "product.js"));
const User = require(path.join(__dirname, "user.js"));
const userSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    }
});
userSchema.methods.addToCart = function(product) {
    const user = this;

    if (!product || !product._id) {
        return Promise.reject(new Error('Invalid product provided'));
    }

    const existingProductIndex = user.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

    if (existingProductIndex !== -1) {
        // If product exists, update its quantity
        user.cart.items[existingProductIndex].quantity += 1;
    } else {
        // If product doesn't exist, add it to the cart
        user.cart.items.push({
            productId: product._id,
            quantity: 1
        });
    }

<<<<<<< HEAD
    // Retrieve the price of each product from the database
    return Product.findById(product._id)
        .then(foundProduct => {
            if (!foundProduct) {
                throw new Error('Product not found');
            }

            const productPrice = foundProduct.price;
            user.cart.totalPrice += productPrice;
=======

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
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f

            // Save the updated cart
            return user.save();
        })
        .then(updatedUser => {
            return updatedUser;
        })
        .catch(err => {
            throw err;
        });
};
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.incrementCart = function(productId) {
    let currentItems = this.cart.items;
    // console.log(currentItems);
    let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

    if (existingProductIndex !== -1) {
        const currentQuantity = currentItems[existingProductIndex].quantity;
        currentItems[existingProductIndex].quantity = currentQuantity + 1;

        return Product.findById(productId)
            .then(product => {
                if (!product) {
                    throw new Error("Product not found");
                }
                let productPrice = product.price;
                this.cart.totalPrice += productPrice;
                return this.save();
            })
            .catch(err => console.log(err));
    } else {
        console.log("Product not found in cart.");
        return Promise.resolve();
    }
};
userSchema.methods.decrementCart = function(productId) {
    let currentItems = this.cart.items;
    // console.log(currentItems);
    let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

    if (existingProductIndex !== -1) {
        const currentQuantity = currentItems[existingProductIndex].quantity;
        currentItems[existingProductIndex].quantity = currentQuantity - 1;
        if (currentItems[existingProductIndex].quantity === 0) {
            const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
            this.cart.items = updatedCartItems;
            return this.save();
        }
        return Product.findById(productId)
            .then(product => {
                if (!product) {
                    throw new Error("Product not found");
                }
                let productPrice = product.price;
                this.cart.totalPrice -= productPrice;
                return this.save();
            })
            .catch(err => console.log(err));
    } else {
        console.log("Product not found in cart.");
        return Promise.resolve();
    }
};
module.exports = mongoose.model('User', userSchema);