const path = require('path');
const { Product } = require(path.join(__dirname, "..", "models", "product.js"));
const { Cart } = require(path.join(__dirname, "..", "models", "cart.js"));
const { Order } = require(path.join(__dirname, "..", "models", "order.js"));
const { OrderItem } = require(path.join(__dirname, "..", "models", "order-item.js"));
const { CartItem } = require(path.join(__dirname, "..", "models", "cart-item.js"));
// const fs = require("fs");

const postOrder = (req, res, next) => {
    const userId = req.cart[0].dataValues.userId;

    // Find all cart items for the user
    CartItem.findAll({
            where: { cartUserId: userId }
        })
        .then(cartItems => {
            // Calculate totalQuantity
            let totalQuantity = 0;
            cartItems.forEach(cartItem => {
                totalQuantity += cartItem.quantity;
            });

            // Create an order for the user
            return Order.create({
                    userId: userId,
                    quantity: totalQuantity // Adding totalQuantity to the Order table
                        // You may want to add more information here, like order total, address, etc.
                })
                .then(order => {
                    // Map cart items to order items and associate them with the order
                    const orderItems = cartItems.map(cartItem => {
                        return {
                            orderId: order.id,
                            productId: cartItem.productId,
                            quantity: cartItem.quantity
                        };
                    });
                    // Create order items
                    return OrderItem.bulkCreate(orderItems);
                })
                .then(() => {
                    // Clear the cart after order creation
                    return CartItem.destroy({
                        where: { cartUserId: userId }
                    });
                })
                .then(() => {
                    // Redirect to some success page or render a success message
                    res.redirect("/shop/orders");
                })
                .catch(err => {
                    console.error('Error creating order:', err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch(err => {
            console.error('Error fetching cart items:', err);
            res.status(500).send('Internal Server Error');
        });
}

const getOrders = (req, res, next) => {
    Order.findAll()
        .then(orders => {
            OrderItem.findAll()
                .then(orderItems => {
                    // Fetch product information separately
                    const productIds = orderItems.map(orderItem => orderItem.productId);
                    Product.findAll({ where: { id: productIds } })
                        .then(products => {
                            // Map product information to order items
                            const orderItemsWithProductInfo = orderItems.map(orderItem => {
                                const product = products.find(product => product.id === orderItem.productId);
                                return {
                                    id: orderItem.id,
                                    quantity: orderItem.quantity,
                                    createdAt: orderItem.createdAt,
                                    updatedAt: orderItem.updatedAt,
                                    orderId: orderItem.orderId,
                                    productId: orderItem.productId,
                                    product: product // Include product information
                                };
                            });

                            const ejsPath = path.join(__dirname, "..", "views", "shop", "order.ejs");
                            res.render(ejsPath, {
                                orders: orders,
                                orderItems: orderItemsWithProductInfo,
                                pageTitle: "Orders and Items",
                                path: "/shop/orders"
                            });
                        })
                        .catch(err => {
                            console.error('Error fetching products:', err);
                            res.status(500).send('Internal Server Error');
                        });
                })
                .catch(err => {
                    console.error('Error fetching order items:', err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            res.status(500).send('Internal Server Error');
        });
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
    const userId = req.cart[0].dataValues.userId;

    if (userId === 1) {
        CartItem.findAll({
                where: {
                    cartUserId: userId
                }
            })
            .then(cartProducts => {
                const productIds = cartProducts.map(item => item.productId);

                return Product.findAll({
                        where: {
                            id: productIds
                        }
                    })
                    .then(products => {
                        const productMap = {};
                        products.forEach(product => {
                            productMap[product.id] = product;
                        });

                        const cartProductsList = cartProducts.map(item => {
                            return {

                                productData: {
                                    id: productMap[item.productId].id,
                                    title: productMap[item.productId].title,
                                    quantity: item.quantity,
                                    imageUrl: productMap[item.productId].imageUrl
                                }
                            };
                        });

                        console.log("Cart products list:", cartProductsList);

                        res.render(ejsPath, { path: "/shop/cart", cartProducts: cartProductsList, pageTitle: "CART", totalPrice: 0 });
                    });
            })
            .catch(err => {
                console.error('Error fetching cart items:', err);
                res.status(500).send('Internal Server Error');
            });
    } else {
        res.status(404).send('Cart not found');
    }
}



const postCart = (req, res, next) => {
    const productId = req.body.productId;
    const cartUserId = 1;


    CartItem.findOne({
            where: {
                productId: productId,
                cartUserId: cartUserId
            }
        })
        .then(cartItem => {
            if (cartItem) {
                cartItem.id = productId;
                cartItem.quantity += 1;
                cartItem.cartUserId = cartUserId;
                return cartItem.save();


            } else {
                return CartItem.create({
                    id: productId,
                    quantity: 1,
                    cartUserId: cartUserId,
                    productId: productId
                });
            }
        })
        .then(() => {
            res.redirect("/shop/cart");
        })
        .catch(err => {
            console.error('Error adding product to cart:', err);
            res.status(500).send('Internal Server Error');
        });
}

const postCartDelete = (req, res, next) => {
    const productId = req.body.productId;
    CartItem.findOne({
            where: { productId: productId }
        })
        .then((cartItem) => {
            if (!cartItem) {
                throw new Error("CartItem not found");
            }

            return cartItem.destroy();
        })
        .then(() => {
            res.redirect("/shop/cart");
        })
        .catch(err => console.log(err));
};


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
    Product.findAll({
            where: {
                id: prodId
            }
        })
        .then((product) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "product-detail.ejs");
            res.render(ejsPath, {
                product: product[0],
                pageTitle: product[0].title,
                path: "/shop/products",
            })
        })
        .catch((err) => { console.log(err) })

};
const postCartIncrement = (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.cart[0].dataValues.userId;

    if (userId === 1) {
        // Find the cart item with the given product ID
        CartItem.findOne({
                where: {
                    productId: productId
                }
            })
            .then((cartItem) => {
                if (cartItem) {
                    // If the cart item exists, increment its quantity
                    cartItem.quantity += 1;
                    return cartItem.save(); // Save the updated cart item
                }
            })
            .then((updatedCartItem) => {
                // Handle the response after updating the cart item
                console.log(updatedCartItem);
                res.redirect("/shop/cart");
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Internal server error");
            });
    } else {
        // Handle unauthorized access
        res.status(403).send("Unauthorized");
    }
}
const postCartDecrement = (req, res, next) => {
    const productId = req.body.productId;
    const userId = req.cart[0].dataValues.userId;

    if (userId === 1) {
        // Find the cart item with the given product ID
        CartItem.findOne({
                where: {
                    productId: productId
                }
            })
            .then((cartItem) => {
                if (cartItem) {
                    // If the cart item exists, decrement its quantity
                    cartItem.quantity -= 1; // Corrected decrement operation
                    // Save the updated cart item
                    if (cartItem.quantity === 0) {
                        return cartItem.destroy();
                    }
                    return cartItem.save();
                }
            })
            .then((updatedCartItem) => {
                // Handle the response after updating the cart item
                // console.log(updatedCartItem);
                res.redirect("/shop/cart");
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Internal server error");
            });
    } else {
        // Handle unauthorized access
        res.status(403).send("Unauthorized");
    }
}



module.exports = { postOrderMethod: postOrder, getIndexFileMethod: getIndex, getCartMethod: getCart, postCartMethod: postCart, allProducts, productId, postCartDeleteMethod: postCartDelete, postCartIncrement, postCartDecrement, getOrders };