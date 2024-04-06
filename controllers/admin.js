const path = require('path');

const User = require(path.join(__dirname, "..", "models", "user.js"));
const Product = require(path.join(__dirname, "..", "models", "product.js"));
// const { Cart } = require(path.join(__dirname, "..", "models", "cart.js"));
const addProductToYourListGet = (req, res, next) => {
    if (!req.session.isLoggedin) {
        return res.redirect("/auth/login");
    }
    const ejsPath = path.join(__dirname, "..", "views", "admin", "add-product.ejs")
    res.render(ejsPath, {
        pageTitle: 'ADD PRODUCT',
        path: "/admin/add-product",
        isAuthenticated: req.session.isLoggedin,
        csrfToken: req.csrfToken(),
    });
};

const addProductToYourListPost = (req, res, next) => {
    const title = req.body.productName;
    const img = req.body.productImg;
    const price = parseInt(req.body.productPrice, 10);
    const description = req.body.productDescription;
    // console.log("1", req.user);
    // const userId = req.user._id;

    const product = new Product({ title: title, imageUrl: img, price: price, description: description, userId: req.session.user._id });

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

    Product.findByIdAndDelete(prodId)
        .then(result => {
            console.log(result); // Log the result of product deletion

            // Find users who have the product in their cart
            return User.find({ 'cart.items.productId': prodId });
        })
        .then(usersWithProduct => {
            // Update the carts of users who have the product in their cart
            const updatePromises = usersWithProduct.map(user => {
                user.cart.items = user.cart.items.filter(item => item.productId.toString() !== prodId.toString());
                return user.save();
            });

            // Wait for all updates to finish
            return Promise.all(updatePromises);
        })
        .then(() => {
            // Redirect to admin products page after successful deletion and cart updates
            res.redirect("/admin/products");
        })
        .catch(err => {
            console.error(err);
            next(err); // Pass the error to the error handling middleware
        });
};

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
                pageTitle: fetchedProduct.title,
                path: "/admin/edit-product",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),

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
            productData.title = title;
            productData.imageUrl = img;
            productData.price = price;
            productData.description = description;
            // Update product fields

            // Save the updated product
            return productData.save()
                .then(result => {
                    console.log("PRODUCT EDITED");
                    res.redirect("/admin/products");
                })
                .catch(err => {
                    console.error("Error saving edited product:", err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch(err => {
            console.error("Error editing product:", err);
            res.status(500).send('Internal Server Error');
        });
};





const getProducts = (req, res, next) => {
    const isLoggedIn = req.get("Cookie") ? req.get("Cookie").substring(req.get("Cookie").indexOf("loggedIn=") + 9) : false;
    Product.find()
        .populate('userId')
        .then((fetchedProducts) => {
            // console.log("Fetched products:", fetchedProducts);
            const ejsPath = path.join(__dirname, "..", "views", "shop", "shop.ejs")
            res.render(ejsPath, {
                path: "/admin/products",
                prods: fetchedProducts,
                pageTitle: "ADMIN PRODUCTS",
                isAuthenticated: req.session.isLoggedin,
                csrfToken: req.csrfToken(),

            });
        })
        .catch((err) => console.log(err));
}

module.exports = { addProduct: addProductToYourListGet, addProductPost: addProductToYourListPost, editProductMethod: editProductGet, editProductPostMethod: editProductPost, getProductsMethod: getProducts, deleteProductPostMethod: deleteProductPost };