const path = require("path");
const express = require("express");
const productClass = require(path.join(__dirname, "..", "models", "product.js"));
const router = express.Router();
const productController = require(path.join(__dirname, "..", "controllers", "shop.js"));
router.get("/", productController["getIndexFileMethod"]);
router.get("/products", productController.allProducts);
router.get("/products/:prodId", productController["productId"]);
router.get("/orders", productController["getOrderMethod"]);
router.get("/cart", productController["getCartMethod"]);
router.post("/cart", productController["postCartMethod"]);
router.get("/checkout", productController["getCheckoutMethod"]);
router.post("/cart-delete", productController["postCartDeleteMethod"])

module.exports = { "router": router };