const path = require("path");
const express = require("express");
const productClass = require(path.join(__dirname, "..", "models", "product.js"));
const router = express.Router();
const productController = require(path.join(__dirname, "..", "controllers", "shop.js"));
router.get("/", productController["getIndexFileMethod"]);
router.get("/products", productController.allProducts);
router.get("/products/:prodId", productController["productId"]);
router.post("/orders", productController["postOrderMethod"]);
router.get("/cart", productController["getCartMethod"]);
router.post("/cart", productController["postCartMethod"]);
router.get("/orders", productController["getOrders"]);
router.post("/cart-delete", productController["postCartDeleteMethod"])
router.post("/cart-update-increment", productController["postCartIncrement"]);
router.post("/cart-update-decrement", productController["postCartDecrement"]);
module.exports = { "router": router };