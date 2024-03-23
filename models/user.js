const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.join(__dirname, "..", "utils", "database.js"));
const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,

    },
    email: {
        type: Sequelize.STRING
    }
})
module.exports = { User };