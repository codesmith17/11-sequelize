const path = require("path");
const mongodb = require("mongodb");
const { getDb } = require(path.join(__dirname, "..", "utils", "database.js"));

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(this._id) : null;
        this.userId = userId;
    }
    save() {
        const db = getDb();
        let dbOp;
        if (this._id) {
            dbOp = db.collection('products').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });
        } else {
            dbOp = db
                .collection('products')
                .insertOne(this);
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err))
    }
    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray()
            .then(products => { return products; })
            .catch(err => console.log(err));
    }
    static findById(prodId) {
        const db = getDb();
        return db.collection('products')
            .find({ _id: new mongodb.ObjectId(prodId) })
            .next()
            .then(product => { console.log(product); return product; })
            .catch(err => console.log(err))


    }
    static deleteById(prodId) {
        const db = getDb();
        db.collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(res => {
                console.log(res);
                return res;
            })
            .catch(err => {
                console.log(err);
                throw err; // Propagate the error
            });
    }

}
// const Product = sequelize.define("product", {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     title: Sequelize.STRING,
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false,
//         primaryKey: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false,

//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     userId: {
//         type: Sequelize.INTEGER,
//         // autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
// })
module.exports = { Product }