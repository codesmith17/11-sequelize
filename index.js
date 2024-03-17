const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
const sequelize = require(path.join(__dirname, "utils", "database.js"));
const adminRoute = require(path.join(__dirname, "routes", "admin.js"));
const shopRoute = require(path.join(__dirname, "routes", "shop.js"));
const errorController = require(path.join(__dirname, "controllers", "404.js"));
// const expressHandlebars = require('express-handlebars');
// app.engine("hbs", expressHandlebars.engine({ defaultLayout: false }));
// app.set('view engine', 'pug');
app.set("view engine", "ejs");
app.set('views', 'views');
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
sequelize
    .sync()
    .then(res => {
        // console.log(res);
        app.listen(3000, () => {
            console.log("Server is running on port 3000\nhttp://localhost:3000");
        });
    })
    .catch((err) => console.log(err))