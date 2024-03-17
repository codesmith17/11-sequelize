const path = require("path");
const fs = require("fs");

const dataCartPath = path.join(__dirname, "..", "data", "cart.json");

class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(dataCartPath, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }

            let existingProductIndex = -1;

            for (let i = 0; i < cart.products.length; i++) {
                if (cart.products[i].id === id) {
                    existingProductIndex = i;
                    break;
                }
            }
            let updatedProduct;
            const existingProduct = cart.products[existingProductIndex];
            if (existingProductIndex !== -1) {
                // If the product already exists in the cart, you can perform operations here.
                updatedProduct = {...existingProduct };
                updatedProduct.quantity = updatedProduct.quantity + 1;
                cart.products[existingProductIndex] = updatedProduct;



            } else {

                updatedProduct = { id: id, quantity: 1 };
                console.log(`Adding product with ID ${id} to the cart.`);
                cart.products = [...cart.products, updatedProduct];

            }
            cart.totalPrice = parseInt(cart.totalPrice, 10) + parseInt(productPrice, 10);
            fs.writeFile(dataCartPath, JSON.stringify(cart), (err) => { console.log(err) });


        });
    }
    static fetchAll(callback) {
        const datapath = path.join(__dirname, "..", "data", "cart.json");
        fs.readFile(datapath, (err, fileContent) => {
            if (err) {
                callback({ products: [], totalPrice: 0 });
            } else {
                callback(JSON.parse(fileContent));
            }
        })
    }
    static getCart(callback) {
        const datapath = path.join(__dirname, "..", "data", "cart.json");
        fs.readFile(datapath, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                callback({ products: [], totalPrice: 0 });
            } else {
                callback(cart);
            }
        })
    }
}
module.exports = { Cart }