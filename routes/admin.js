const express = require('express');
const router = express.Router();
const path = require('path');

const { isAuth } = require(path.join(__dirname, "..", "middleware", "is-auth.js"));
const addProductObject = require(path.join(__dirname, "..", "controllers", "admin.js"));


router.get('/add-product', addProductObject["addProduct"]);
router.post("/add-product", addProductObject["addProductPost"]);
router.get("/products", addProductObject["getProductsMethod"]);
router.post("/delete-product/:productId", addProductObject["deleteProductPostMethod"]);
router.get("/edit-product/:productId", addProductObject["editProductMethod"]);
router.post("/edit-product/:productId", addProductObject["editProductPostMethod"]);


// router.post("/delete-product/:productId", addProductObject["deleteProductPostMethod"]);
module.exports = { "router": router };