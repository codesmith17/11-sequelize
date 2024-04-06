<<<<<<< HEAD
const path = require('path');
const Product = require(path.join(__dirname, "..", "models", "product.js"));
const Order = require(path.join(__dirname, "..", "models", "order.js"));

// const { Order } = require(path.join(__dirname, "..", "models", "order.js"));
// const { OrderItem } = require(path.join(__dirname, "..", "models", "order-item.js"));
// const { CartItem } = require(path.join(__dirname, "..", "models", "cart-item.js"));
// const fs = require("fs");

const postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            // console.log(req.user)
            console.log(user);
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: {...item.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id
                },
                products: products
            });
            return order.save()
                .then(result => {

                    req.user.cart = { items: [] };
                    return req.user.save();
                });
        })
        .then(result => {
            res.redirect("/shop/orders");
        })
        .catch(err => console.log(err));
};


const getOrders = (req, res, next) => {
    // const isLoggedin = req.get("Cookie") ? req.get("Cookie").substring(req.get("Cookie").indexOf("loggedIn=") + 9) : false; // Default to false if cookieHeader is undefined
    console.log(req.user._id)
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            console.log("hellop", orders);
            const ejsPath = path.join(__dirname, "..", "views", "shop", "order.ejs");
            res.render(ejsPath, {
                path: "/shop/orders",
                pageTitle: "AAPKE ORDERS",
                orders: orders,
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),

            });
        })
        .catch(err => console.log(err));
};
=======
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
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f

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

<<<<<<< HEAD
const getIndex = (req, res, next) => {
    // const isLoggedin = req.get("Cookie") ? req.get("Cookie").substring(req.get("Cookie").indexOf("loggedIn=") + 9) : false;

    Product.find()
        .then((products) => {
            // console.log("2", products);
            const ejsPath = path.join(__dirname, "..", "views", "shop", "index.ejs");
            res.render((ejsPath), {
                prods: products,
                pageTitle: "INDEX PAGE",
                path: "/shop",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),
            })
        })
        .catch((err) => {
            console.log(err);
        })

};

const getCart = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "shop", "cart.ejs");
    // console.log("1", req.session);
    req.user
        .populate('cart.items.productId')
        .then(products => {

            // Handle products, e.g., render a view with the cart items
            console.log("2", products.cart.items);

            res.render(ejsPath, {
                totalPrice: req.user.cart.totalPrice,
                cartProducts: products.cart.items,
                pageTitle: "APNA CART",
                path: "/shop/cart",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),
            });
        })
        .catch(err => {
            console.log(err);
            // Handle error, e.g., render an error page
            res.status(500).send('Error fetching cart');
        });
=======
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
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f


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

<<<<<<< HEAD
const postCart = (req, res, next) => {
    const productId = req.body.productId;
    // console.log(req.user);
=======
        if (existingProductIndex !== -1) {
            const currentQuantity = currentItems[existingProductIndex].quantity;

            // Decrement the quantity
            currentItems[existingProductIndex].quantity = Math.max(0, currentQuantity - 1);
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f

            // If quantity becomes 0, remove the item from the array
            if (currentItems[existingProductIndex].quantity === 0) {
                currentItems.splice(existingProductIndex, 1);
            }

<<<<<<< HEAD
            return req.user.addToCart(product); // Returning the promise chain
        })
        .then(() => {
            // After the addToCart operation is completed, redirect to cart
            res.redirect("/shop/cart");
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}
=======
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
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f





<<<<<<< HEAD
const postCartDelete = (req, res, next) => {
    const productId = req.body.productId;
    // console.log(productId);
    req.user.removeFromCart(productId)
        .then(() => {
            // Handle success, e.g., redirect to the appropriate page
            return res.redirect('/shop/cart');
        })
        .catch(err => {
            console.log(err);
            // Handle error, e.g., render an error page
            res.status(500).send('Error deleting item from cart');
        });
};



const allProducts = (req, res, next) => {

    Product.find()
        .then((products) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "index.ejs");
            res.render((ejsPath), {
                prods: products,
                pageTitle: "INDEX PAGE",
                path: "/shop",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),

=======





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
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f
            })
            .then(result => {
                this.cart = { items: [], totalPrice: 0 };
                return db.collection('users')
                    .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } })
            });

    }

}

<<<<<<< HEAD

const productId = (req, res, next) => {
    const prodId = req.params.prodId;
    // console.log(1);
    // console.log(prodId);
    // const isLoggedin = req.get("Cookie") ? req.get("Cookie").substring(req.get("Cookie").indexOf("loggedIn=") + 9) : false;
    Product.findById(prodId)
        .then((product) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "product-detail.ejs");
            console.log("1", product);
            res.render(ejsPath, {
                product: product,
                pageTitle: product.title,
                path: "/shop/products",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),

            })
        })
        .catch((err) => { console.log(err) })

};
const postCartIncrement = (req, res, next) => {
    const productId = req.body.productId;
    // console.log("assd", productId);
    req.user.
    incrementCart(productId)
        .then(() => res.redirect("/shop/cart"))
        .catch(err => console.log(err));


}
const postCartDecrement = (req, res, next) => {
    const productId = req.body.productId;
    req.user.decrementCart(productId)
        .then(() => res.redirect("/shop/cart"))
        .catch(err => console.log(err))
}



module.exports = { getIndexFileMethod: getIndex, productId, allProducts, postCartMethod: postCart, getCartMethod: getCart, postCartDeleteMethod: postCartDelete, postCartIncrement, postCartDecrement, postOrderMethod: postOrder, getOrders }
=======
module.exports = { User }
>>>>>>> 51160bd7a7fcc42be4ee9e878e2d6df522ad4d7f
