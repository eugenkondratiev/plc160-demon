const MongoClient = require("mongodb").MongoClient;
const dotenv = require('dotenv');
dotenv.config();

const { MONGODB_URI, MONGODB_DB_NAME, MONGODB_LOCAL_URI, MONGODB_LOCAL_DB_NAME } = process.env;

let cachedDb = null;
module.exports = (_local = false) => {
  if (cachedDb && cachedDb._db && cachedDb._db.serverConfig.isConnected()) {
    console.log("###CONNECTED")
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(_local ? MONGODB_LOCAL_URI : MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(client => {

    const dataBase = client.db(_local ? MONGODB_LOCAL_DB_NAME : MONGODB_DB_NAME);
    return { _db: dataBase, client: client };
  });
};
