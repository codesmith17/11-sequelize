const path = require('path');
const { Product } = require(path.join(__dirname, "..", "models", "product.js"));
const { Cart } = require(path.join(__dirname, "..", "models", "cart.js"));
const fs = require("fs");

const getOrders = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "shop", "orders.ejs")
    res.render(ejsPath, {
        path: "/orders",
        pageTitle: "ORDERS"
    })
}

const getIndex = (req, res, next) => {

    Product.findAll()
        .then((products) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "index.ejs");
            res.render((ejsPath), {
                prods: products,
                pageTitle: "INDEX PAGE",
                path: "/shop"
            })
        })
        .catch((err) => {
            console.log(err);
        })

};

const getCart = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "shop", "cart.ejs");
    const cartProducts = [];
    Cart.getCart((fetchedCart) => {

        Product.findAll((products) => {
            // console.log("Fetched products:", fetchedCart.products.length, "wow", products);
            for (let i = 0; i < products.length; i++) {
                for (let j = 0; j < fetchedCart.products.length; j++) {
                    if (products[i]["id"] === fetchedCart["products"][j]["id"])
                        cartProducts.push({ productData: products[i], quantity: fetchedCart["products"][j]["quantity"] })
                }
            }
            console.log(cartProducts);
            res.render(ejsPath, { path: "/shop/cart", cartProducts: cartProducts, pageTitle: "CART", totalPrice: fetchedCart.totalPrice });
        })

    });
}
const postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId, product => {
        Cart.addProduct(productId, product.price);
    })
    res.redirect("/shop/cart")
}
const postCartDelete = (req, res, next) => {
    const productId = req.body.productId;
    Cart.fetchAll((fetchedProducts) => {
        let cartProductToBeDeletedIndex;

        for (let i = 0; i < fetchedProducts.products.length; i++) {
            if (productId === fetchedProducts.products[i].id) {
                cartProductToBeDeletedIndex = i;
                break;
            }
        }
        let priceToBeSubtracted;
        Product.findById(productId, product => {
            let qty = fetchedProducts.products[cartProductToBeDeletedIndex].quantity;
            priceToBeSubtracted = product.price * qty;
            fetchedProducts.totalPrice -= priceToBeSubtracted;
            const cartDataPath = path.join(__dirname, "..", "data", "cart.json");

            if (cartProductToBeDeletedIndex !== -1) {
                fetchedProducts.products.splice(cartProductToBeDeletedIndex, 1);

                fs.writeFile(cartDataPath, JSON.stringify(fetchedProducts), (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect("/shop/cart");
                    }
                });
            } else {
                console.log('Product not found');
                res.redirect("/shop/cart");
            }
        });





    });
};
const getCheckout = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "shop", "index.ejs");
    res.render(ejsPath, {
        path: "/admin/products",
        pageTitle: "CHECKOUT"
    })
}
const allProducts = (req, res, next) => {
    Product.findAll()
        .then((products) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "index.ejs");
            res.render((ejsPath), {
                prods: products,
                pageTitle: "INDEX PAGE",
                path: "/shop"
            })
        })
        .catch((err) => {
            console.log(err);
        })

}


const productId = (req, res, next) => {
    const prodId = req.params.prodId;
    // console.log(prodId);
    Product.findAll({
            where: {
                id: prodId
            }
        })
        .then((product) => {
            // console.log(product);
            const ejsPath = path.join(__dirname, "..", "views", "shop", "product-detail.ejs");
            res.render(ejsPath, {
                product: product[0],
                pageTitle: product[0].title,
                path: "/shop/products",
            })
        })
        .catch((err) => { console.log(err) })

};

module.exports = { getOrderMethod: getOrders, getIndexFileMethod: getIndex, getCartMethod: getCart, postCartMethod: postCart, getCheckoutMethod: getCheckout, allProducts, productId, postCartDeleteMethod: postCartDelete };