const express = require("express");
const app = express();
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const csrf = require("csurf");
// const mongodb = require("mongodb");
const path = require('path');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
// const { mongoConnect } = require(path.join(__dirname, "utils", "database.js"));
const bodyParser = require('body-parser');
// const { getDb } = require(path.join(__dirname, "utils", "database.js"));
app.use(bodyParser.urlencoded({ extended: false }));
const MONGODB_URI = "mongodb+srv://krishna170902:44AueKgqHr2eDL8o@clusteracademind.ub2btq6.mongodb.net/shop?retryWrites=false&w=majority&appName=ClusterAcademind";
const router = express.Router();
const shopRoute = require(path.join(__dirname, "routes", "shop.js"));
const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions' });
const csrfProtection = csrf();
const flash = require("connect-flash");
const authRoute = require(path.join(__dirname, "routes", "auth.js"));
const errorController = require(path.join(__dirname, "controllers", "404.js"));
const User = require(path.join(__dirname, "models", "user.js"));



app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            console.log(user);
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});


app.use(flash());
const adminRoute = require(path.join(__dirname, "routes", "admin.js"));
app.use("/auth", authRoute.router);
app.use("/admin", adminRoute.router);
app.use("/shop", shopRoute.router);





// const expressHandlebars = require('express-handlebars');
// app.engine("hbs", expressHandlebars.engine({ defaultLayout: false }));
// app.set('view engine', 'pug');
// const { Product } = require(path.join(__dirname, "models", "product.js"));

app.set("view engine", "ejs");
app.set('views', 'views');
// app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }))

// app.use("/", (req, res, next) => {
//     res.redirect("/shop");
//     // next();
// });


app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.redirect("/shop");
});

app.get("*", errorController["errorFunctionController"]);


mongoose.connect(MONGODB_URI)
    .then(result => {
        console.log("CONNECTED");

        app.listen(3000);
    })
    .catch(err => console.log(err))