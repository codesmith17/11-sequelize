const path = require('path');
const { Product } = require(path.join(__dirname, "..", "models", "product.js"));
const { User } = require(path.join(__dirname, "..", "models", "user.js"));
// const { Order } = require(path.join(__dirname, "..", "models", "order.js"));
// const { OrderItem } = require(path.join(__dirname, "..", "models", "order-item.js"));
// const { CartItem } = require(path.join(__dirname, "..", "models", "cart-item.js"));
// const fs = require("fs");

// const postOrder = (req, res, next) => {
//     const userId = req.cart[0].dataValues.userId;

//     // Find all cart items for the user
//     CartItem.findAll({
//             where: { cartUserId: userId }
//         })
//         .then(cartItems => {
//             // Calculate totalQuantity
//             let totalQuantity = 0;
//             cartItems.forEach(cartItem => {
//                 totalQuantity += cartItem.quantity;
//             });

//             // Create an order for the user
//             return Order.create({
//                     userId: userId,
//                     quantity: totalQuantity // Adding totalQuantity to the Order table
//                         // You may want to add more information here, like order total, address, etc.
//                 })
//                 .then(order => {
//                     // Map cart items to order items and associate them with the order
//                     const orderItems = cartItems.map(cartItem => {
//                         return {
//                             orderId: order.id,
//                             productId: cartItem.productId,
//                             quantity: cartItem.quantity
//                         };
//                     });
//                     // Create order items
//                     return OrderItem.bulkCreate(orderItems);
//                 })
//                 .then(() => {
//                     // Clear the cart after order creation
//                     return CartItem.destroy({
//                         where: { cartUserId: userId }
//                     });
//                 })
//                 .then(() => {
//                     // Redirect to some success page or render a success message
//                     res.redirect("/shop/orders");
//                 })
//                 .catch(err => {
//                     console.error('Error creating order:', err);
//                     res.status(500).send('Internal Server Error');
//                 });
//         })
//         .catch(err => {
//             console.error('Error fetching cart items:', err);
//             res.status(500).send('Internal Server Error');
//         });
// }

// const getOrders = (req, res, next) => {
//     Order.findAll()
//         .then(orders => {
//             OrderItem.findAll()
//                 .then(orderItems => {
//                     // Fetch product information separately
//                     const productIds = orderItems.map(orderItem => orderItem.productId);
//                     Product.findAll({ where: { id: productIds } })
//                         .then(products => {
//                             // Map product information to order items
//                             const orderItemsWithProductInfo = orderItems.map(orderItem => {
//                                 const product = products.find(product => product.id === orderItem.productId);
//                                 return {
//                                     id: orderItem.id,
//                                     quantity: orderItem.quantity,
//                                     createdAt: orderItem.createdAt,
//                                     updatedAt: orderItem.updatedAt,
//                                     orderId: orderItem.orderId,
//                                     productId: orderItem.productId,
//                                     product: product // Include product information
//                                 };
//                             });

//                             const ejsPath = path.join(__dirname, "..", "views", "shop", "order.ejs");
//                             res.render(ejsPath, {
//                                 orders: orders,
//                                 orderItems: orderItemsWithProductInfo,
//                                 pageTitle: "Orders and Items",
//                                 path: "/shop/orders"
//                             });
//                         })
//                         .catch(err => {
//                             console.error('Error fetching products:', err);
//                             res.status(500).send('Internal Server Error');
//                         });
//                 })
//                 .catch(err => {
//                     console.error('Error fetching order items:', err);
//                     res.status(500).send('Internal Server Error');
//                 });
//         })
//         .catch(err => {
//             console.error('Error fetching orders:', err);
//             res.status(500).send('Internal Server Error');
//         });
// }



const getIndex = (req, res, next) => {

    Product.fetchAll()
        .then((products) => {
            // console.log("2", products);
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
    req.user.getCart()
        .then(products => {

            // Handle products, e.g., render a view with the cart items
            console.log(products);
            res.render(ejsPath, { totalPrice: req.user.cart.totalPrice, cartProducts: products, pageTitle: "APNA CART", path: "/shop/cart" });
        })
        .catch(err => {
            console.log(err);
            // Handle error, e.g., render an error page
            res.status(500).send('Error fetching cart');
        });


}



const postCart = (req, res, next) => {
    const productId = req.body.productId;
    console.log(req.user);


    Product.findById(productId)
        .then(product => {
            if (!product) {
                throw new Error('Product not found');
            }

            req.user.addToCart(product);
        })
        .then(() => {
            // console.log(result);
            res.redirect("/shop/cart");
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}





const postCartDelete = (req, res, next) => {
    const productId = req.body.productId;
    // console.log(productId);
    req.user.cartDelete(productId)
        .then(() => {
            // Handle success, e.g., redirect to the appropriate page
            return res.redirect('/shop/cart');
        })
        .catch(err => {
            console.log(err);
            // Handle error, e.g., render an error page
            res.status(500).send('Error deleting item from cart');
        });
};



const allProducts = (req, res, next) => {
    Product.fetchAll()
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
    Product.findById(prodId)
        .then((product) => {
            const ejsPath = path.join(__dirname, "..", "views", "shop", "product-detail.ejs");
            // console.log("1", product);
            res.render(ejsPath, {
                product: product,
                pageTitle: product.title,
                path: "/shop/products",
            })
        })
        .catch((err) => { console.log(err) })

};
const postCartIncrement = (req, res, next) => {
    const productId = req.body.productId;
    // console.log("assd", productId);
    req.user.incrementCart(productId)
        .then(() => res.redirect("/shop/cart"))
        .catch(err => console.log(err));


}
const postCartDecrement = (req, res, next) => {
    const productId = req.body.productId;
    req.user.decrementCart(productId)
        .then(() => res.redirect("/shop/cart"))
        .catch(err => console.log(err))
}



module.exports = { getIndexFileMethod: getIndex, productId, allProducts, postCartMethod: postCart, getCartMethod: getCart, postCartDeleteMethod: postCartDelete, postCartIncrement, postCartDecrement }