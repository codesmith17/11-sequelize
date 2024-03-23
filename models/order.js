const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.join(__dirname, "..", "utils", "database.js"));
const Order = sequelize.define("order", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: {
        type: Sequelize.INTEGER
    }

})
module.exports = { Order }