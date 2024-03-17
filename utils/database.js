const Sequelize = require("sequelize");
const sequelize = new Sequelize("node-complete", "root", "Yash@2012", { dialect: "mysql", host: "localhost" })
module.exports = sequelize;