const path = require('path');
const fs = require("fs");
const { timeEnd } = require('console');
const { where } = require('sequelize');
const { Product } = require(path.join(__dirname, "..", "models", "product.js"));
const { Cart } = require(path.join(__dirname, "..", "models", "cart.js"));
const addProductToYourListGet = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "admin", "add-product.ejs")
    res.render(ejsPath, { pageTitle: 'Add product', path: "/admin/add-product" });
};

const addProductToYourListPost = (req, res, next) => {
    const title = req.body.productName;
    const img = req.body.productImg;
    const price = parseInt(req.body.productPrice, 10);
    const description = req.body.productDescription;
    Product.create({
            title: title,
            price: price,
            imageUrl: img, // Fix: Use img instead of imageUrl
            description: description
        })
        .then((result) => {
            console.log(result);
            res.redirect("/admin/add-product");
        })
        .catch(err => console.log(err));
};

const editProductGet = (req, res, next) => {
    const productId = req.params.productId;
    const ejsPath = path.join(__dirname, "..", "views", "admin", "edit-product.ejs");

    Product.findByPk(productId)
        .then((fetchedProduct) => {
            if (!fetchedProduct) {
                res.status(404).send("Product not found");
                return;
            }

            res.render(ejsPath, {
                product: fetchedProduct,
                pageTitle: fetchedProduct.title,
                path: "/admin/edit-product"
            });
        })
        .catch(err => {
            console.error("Error fetching product:", err);
            res.status(500).send("Internal Server Error");
        });
};

const editProductPost = (req, res, next) => {

    const title = req.body.productName;
    const img = req.body.productImg;
    const price = parseInt(req.body.productPrice, 10);
    const description = req.body.productDescription;
    const productId = req.params.productId;
    // // console.log("hi", productId);

    console.log(productId);
    Product.findByPk(productId)
        .then(product => {
            product.title = title;
            product.price = price;
            product.description = description;
            product.imageUrl = img;
            product.save();
            res.redirect("/admin/products")
        })
        .catch(err => console.log(err))

};
const deleteProductPost = (req, res, next) => {
    const productId = req.params.productId;

    Product.findByPk(productId)
        .then((product) => {
            return product.destroy();

        })
        .then((result) => {
            console.log("PRODUCT DESTROYED");
            res.redirect("/admin/products")

        })
        .catch((err) => console.log(err))
};


const getProducts = (req, res, next) => {
    Product.findAll()
        .then((fetchedProducts) => {
            // console.log("Fetched products:", fetchedProducts);
            const ejsPath = path.join(__dirname, "..", "views", "shop", "shop.ejs")
            res.render(ejsPath, {
                path: "/admin/products",
                prods: fetchedProducts,
                pageTitle: "BOOKSHOP",
            });
        })
        .catch((err) => console.log(err));
}

module.exports = { addProduct: addProductToYourListGet, addProductPost: addProductToYourListPost, getProductsMethod: getProducts, editProductMethod: editProductGet, editProductPostMethod: editProductPost, deleteProductPostMethod: deleteProductPost };