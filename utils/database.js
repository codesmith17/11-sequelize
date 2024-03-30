const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = (callback) => {
    MongoClient.connect("mongodb+srv://krishna170902:44AueKgqHr2eDL8o@clusteracademind.ub2btq6.mongodb.net/shop?retryWrites=true&w=majority&appName=ClusterAcademind")
        .then((client) => {
            console.log("CONNECTED!");
            _db = client.db();
            callback();
        })
        .catch(err => { console.log(err); throw err; });
};
const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "NO DATABASE FOUND";
}
module.exports = { mongoConnect: mongoConnect, getDb: getDb };