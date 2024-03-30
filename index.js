const express = require("express");
const app = express();
const mongodb = require("mongodb");
const path = require('path');
const { mongoConnect } = require(path.join(__dirname, "utils", "database.js"));
const bodyParser = require('body-parser');
const { getDb } = require(path.join(__dirname, "utils", "database.js"));
app.use(bodyParser.urlencoded({ extended: false }));

// const router = express.Router();
const shopRoute = require(path.join(__dirname, "routes", "shop.js"));
const errorController = require(path.join(__dirname, "controllers", "404.js"));
// const expressHandlebars = require('express-handlebars');
// app.engine("hbs", expressHandlebars.engine({ defaultLayout: false }));
// app.set('view engine', 'pug');
// const { Product } = require(path.join(__dirname, "models", "product.js"));
const { User } = require(path.join(__dirname, "models", "user.js"));


app.use((req, res, next) => {
    User.findById("660540354ffcef98408f9b88")
        .then(user => {
            // Check if cart exists in user object

            // Create a new User instance with the updated user object
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log(err));
});

const adminRoute = require(path.join(__dirname, "routes", "admin.js"));
app.set("view engine", "ejs");
app.set('views', 'views');


// app.use("/", (req, res, next) => {
//     res.redirect("/shop");
//     // next();
// });
app.use("/admin", adminRoute.router);
app.use("/shop", shopRoute.router);

app.use(express.static(path.join(__dirname, "public")));
// db.execute("SELECT * FROM `node-complete`.`products`;")
//     .then((res) => { console.log(res) })
//     .catch()
// app.get("/", (req, res, next) => {
//     res.redirect("/shop");

// })


// app.use("/", (req, res, next) => {
//     res.redirect("/shop");
// });
app.get("*", errorController["errorFunctionController"]);
mongoConnect(() => {

    app.listen(3000);
})