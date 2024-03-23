const express = require("express");
const app = express();
const path = require('path');
const Sequelize = require('sequelize');
// const CartItem=require(path.join(__dirname))
const sequelize = require(path.join(__dirname, "utils", "database.js"));
const bodyParser = require('body-parser');
const { CartItem } = require("./models/cart-item");
const { Cart } = require("./models/cart");
const { Order } = require(path.join(__dirname, "models", "order.js"));
const { OrderItem } = require(path.join(__dirname, "models", "order-item.js"));
app.use(bodyParser.urlencoded({ extended: false }));


const shopRoute = require(path.join(__dirname, "routes", "shop.js"));
const errorController = require(path.join(__dirname, "controllers", "404.js"));
// const expressHandlebars = require('express-handlebars');
// app.engine("hbs", expressHandlebars.engine({ defaultLayout: false }));
// app.set('view engine', 'pug');
const { Product } = require(path.join(__dirname, "models", "product.js"));
const { User } = require(path.join(__dirname, "models", "user.js"));
const adminRoute = require(path.join(__dirname, "routes", "admin.js"));
app.set("view engine", "ejs");
app.set('views', 'views');
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            // console.log(user.dataValues.id); // Log the user object
            req.user = user;
            // console.log("req.user:", req.user); // Log req.user
            next();
        })
        .catch((err) => {
            console.log("Error:", err); // Log any errors
            next();
        });
});
app.use((req, res, next) => {
    Cart.findAll()
        .then(cart => {
            req.cart = cart;
            next();
        })
        .catch(err => {
            console.log(err);
        })
})


app.use("/admin", adminRoute.router);
app.use("/shop", shopRoute.router);

app.use(express.static(path.join(__dirname, "public")));
// db.execute("SELECT * FROM `node-complete`.`products`;")
//     .then((res) => { console.log(res) })
//     .catch()
app.get("/", (req, res, next) => {
    res.redirect("/shop");

})



app.get("*", errorController["errorFunctionController"]);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
sequelize
    .sync()
    .then(res => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({ name: "RASHMI MANTRI", email: "wow@wow.com" })
        }
        return user;
    })

.then(res => {
        app.listen(3000, () => {
            console.log("Server is running on port 3000\nhttp://localhost:3000");
        });
    })
    .catch((err) => console.log(err))