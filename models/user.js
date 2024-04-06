const mongoose = require("mongoose");
const path = require("path")
const Schema = mongoose.Schema;
const Product = require(path.join(__dirname, "product.js"));
const User = require(path.join(__dirname, "user.js"));
const userSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true }
        }]
    }
});
userSchema.methods.addToCart = function(product) {
    const user = this;

    if (!product || !product._id) {
        return Promise.reject(new Error('Invalid product provided'));
    }

    const existingProductIndex = user.cart.items.findIndex(item => item.productId.toString() === product._id.toString());

    if (existingProductIndex !== -1) {
        // If product exists, update its quantity
        user.cart.items[existingProductIndex].quantity += 1;
    } else {
        // If product doesn't exist, add it to the cart
        user.cart.items.push({
            productId: product._id,
            quantity: 1
        });
    }

    // Retrieve the price of each product from the database
    return Product.findById(product._id)
        .then(foundProduct => {
            if (!foundProduct) {
                throw new Error('Product not found');
            }

            const productPrice = foundProduct.price;
            user.cart.totalPrice += productPrice;

            // Save the updated cart
            return user.save();
        })
        .then(updatedUser => {
            return updatedUser;
        })
        .catch(err => {
            throw err;
        });
};
userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.incrementCart = function(productId) {
    let currentItems = this.cart.items;
    // console.log(currentItems);
    let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

    if (existingProductIndex !== -1) {
        const currentQuantity = currentItems[existingProductIndex].quantity;
        currentItems[existingProductIndex].quantity = currentQuantity + 1;

        return Product.findById(productId)
            .then(product => {
                if (!product) {
                    throw new Error("Product not found");
                }
                let productPrice = product.price;
                this.cart.totalPrice += productPrice;
                return this.save();
            })
            .catch(err => console.log(err));
    } else {
        console.log("Product not found in cart.");
        return Promise.resolve();
    }
};
userSchema.methods.decrementCart = function(productId) {
    let currentItems = this.cart.items;
    // console.log(currentItems);
    let existingProductIndex = currentItems.findIndex(item => item.productId.toString() === productId.toString());

    if (existingProductIndex !== -1) {
        const currentQuantity = currentItems[existingProductIndex].quantity;
        currentItems[existingProductIndex].quantity = currentQuantity - 1;
        if (currentItems[existingProductIndex].quantity === 0) {
            const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
            this.cart.items = updatedCartItems;
            return this.save();
        }
        return Product.findById(productId)
            .then(product => {
                if (!product) {
                    throw new Error("Product not found");
                }
                let productPrice = product.price;
                this.cart.totalPrice -= productPrice;
                return this.save();
            })
            .catch(err => console.log(err));
    } else {
        console.log("Product not found in cart.");
        return Promise.resolve();
    }
};
module.exports = mongoose.model('User', userSchema);