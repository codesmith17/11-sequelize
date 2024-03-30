const express = require('express');
const router = express.Router();
const path = require('path');


const addProductObject = require(path.join(__dirname, "..", "controllers", "admin.js"));


router.get('/add-product', addProductObject["addProduct"]);
router.post("/add-product", addProductObject["addProductPost"])
router.get("/products", addProductObject["getProductsMethod"]);
router.get("/edit-product/:productId", addProductObject["editProductMethod"]);
router.post("/edit-product/:productId", addProductObject["editProductPostMethod"]);
// router.post("/delete-product/:productId", addProductObject["deleteProductPostMethod"]);

router.post("/delete-product/:productId", addProductObject["deleteProductPostMethod"]);
module.exports = { "router": router };