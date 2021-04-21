

const Eco3_COLLECTION = "hourReportsEco3";
const LOCAL_ECO3_COLLECTION = "Eco3";
const fs = require('fs');
const LOCAL = true;
const logIt = require('../logger');

async function insertNewHourRecordToMongo(_manager) {
    try {
        const newRecord = _manager.formMongoDbRecord();
        console.log("##DATA  newRecord ", newRecord);
        const _query = { _id: newRecord._id }
        const _update = {
            $set: {
                _id: newRecord._id,
                values: newRecord.values
            }
        }
        async function inserting(errorFb, _local = false) {
            try {
                const mongoClient = await require('./db-mongo')(_local);
                const data = await mongoClient._db.collection(_local ? LOCAL_ECO3_COLLECTION : Eco3_COLLECTION).updateOne(
                    _query,
                    _update,
                    { upsert: true }
                )
                mongoClient.client.close();
            } catch (error) {
                errorFb(error)
            }
        }

        await inserting((error) => {
            logIt(" collection.updateOne problem " + error.message);
            fs.writeFile('reserv/' + newRecord._id.replace(/:/g, '-') + '.json', JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
        })
        await inserting((error) => {
            LogIt(" Loacl MongoDbcollection.updateOne problem " +  error.message);
        },
            LOCAL)
    } catch (err) {
        console.log("#### FIND ERROR ", err);
    }
}

module.exports = insertNewHourRecordToMongo;



