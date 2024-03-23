const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.join(__dirname, "..", "utils", "database.js"));
const OrderItem = sequelize.define("orderItems", {
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
module.exports = { OrderItem }