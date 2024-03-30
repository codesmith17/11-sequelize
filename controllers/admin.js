const { privateDecrypt } = require('crypto');
const { ObjectId } = require('mongodb');
const path = require('path');


const { Product } = require(path.join(__dirname, "..", "models", "product.js"));
// const { Cart } = require(path.join(__dirname, "..", "models", "cart.js"));
const addProductToYourListGet = (req, res, next) => {
    const ejsPath = path.join(__dirname, "..", "views", "admin", "add-product.ejs")
    res.render(ejsPath, { pageTitle: 'Add product', path: "/admin/add-product" });
};

const addProductToYourListPost = (req, res, next) => {
    const title = req.body.productName;
    const img = req.body.productImg;
    const price = parseInt(req.body.productPrice, 10);
    const description = req.body.productDescription;
    console.log("1", req.user);
    const userId = req.user._id;

    const product = new Product(title, price, description, img, null, userId);

    // console.log(req);    
    // console.log(req.user)


    product.save()
        .then((result) => {
            console.log("ok");
            res.redirect("/admin/products");
        })
        .catch(err => console.log(err));
};


const deleteProductPost = (req, res, next) => {
    const prodId = req.params.productId;
    Product.deleteById(prodId)
        .then(result => {
            console.log(result);
            return result;
        })
        .catch(err => console.log(err))
}
const editProductGet = (req, res, next) => {
    const productId = req.params.productId;
    const ejsPath = path.join(__dirname, "..", "views", "admin", "edit-product.ejs");
    // console.log(productId)
    Product.findById(productId)
        .then((fetchedProduct) => {
            if (!fetchedProduct) {
                res.status(404).send("Product not found");
                return;
            }
            // console.log(fetchedProduct)
            res.render(ejsPath, {
                product: fetchedProduct,
                pageTitle: fetchedPrnoduct.title,
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

    Product.findById(productId)
        .then(productData => {
            if (!productData) {
                return res.status(404).send('Product not found');
            }
            const product = new Product(title, price, description, img, new ObjectId(productId));
            // Update product fields


            // Save the updated product
            product.save().then(result => {
                console.log("PRODUCT EDITED");
                res.redirect("/admin/products");
                // res.redirect("/admin/products");
            }).catch(err => console.log(err));

        })

    .catch(err => {
        console.error("Error editing product:", err);
        res.status(500).send('Internal Server Error');
    });
};






const getProducts = (req, res, next) => {
    Product.fetchAll()
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

module.exports = { addProduct: addProductToYourListGet, addProductPost: addProductToYourListPost, editProductMethod: editProductGet, getProductsMethod: getProducts, editProductPostMethod: editProductPost, deleteProductPostMethod: deleteProductPost };