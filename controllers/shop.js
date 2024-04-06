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


}



const postCart = (req, res, next) => {
    const productId = req.body.productId;
    // console.log(req.user);

    Product.findById(productId)
        .then(product => {
            if (!product) {
                throw new Error('Product not found');
            }

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

            })
        })
        .catch((err) => {
            console.log(err);
        })

}


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