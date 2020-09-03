const MongoClient = require("mongodb").MongoClient;
const dotenv = require('dotenv');
dotenv.config();

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

let cachedDb = null;
module.exports = () => {
  if (cachedDb && cachedDb._db && cachedDb._db.serverConfig.isConnected()) {
      console.log("###CONNECTED")
    return Promise.resolve(cachedDb);
  }
  
  return MongoClient.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true  }).then(client => {
    console.log(DB_NAME);
    console.log(URI);

    const dataBase = client.db(DB_NAME);
    return {_db :dataBase , client: client};
  });
};
