const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.join(__dirname, "..", "utils", "database.js"));
const Product = sequelize.define("product", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        primaryKey: false
    },
    imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,

    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        // autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
})
module.exports = { Product }