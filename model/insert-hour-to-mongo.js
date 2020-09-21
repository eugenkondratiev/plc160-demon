

const Eco3_COLLECTION = "hourReportsEco3";
const LOCAL_ECO3_COLLECTION = "Eco3";
// const Eco3_DB = "Eco";
// const { AVG, MIN, MAX } = require('../reports/report-constants');
const fs = require('fs');
const LOCAL = true;

async function insertNewHourRecordToMongo(_manager) {


    try {
        const newRecord = _manager.formMongoDbRecord();
        console.log("##DATA  newRecord ", newRecord);
        // console.log("##DATA  formSqlRecord ", _manager.formMySQLRecord());
        const _query = { _id: newRecord._id }
        const _update = {
            $set: {
                _id: newRecord._id,
                values: newRecord.values
            }
        }
        async function inserting(fb, _local = false) {
            try {
                const mongoClient = await require('./db-mongo')(_local);
                // const collection = mongoClient._db.collection(Eco3_COLLECTION);
                const data = await mongoClient._db.collection(_local ? LOCAL_ECO3_COLLECTION : Eco3_COLLECTION).updateOne(
                    _query,
                    _update,
                    { upsert: true }
                )
                mongoClient.client.close();
            } catch (error) {
                // console.log(" collection.updateOne problem ", error);
                // fs.writeFile('reserv/' + newRecord._id.replace(/:/g, '-'), JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
                fb(error)
            }
        }

        await inserting((error) => {
            console.log(" collection.updateOne problem ", error);
            fs.writeFile('reserv/' + newRecord._id.replace(/:/g, '-'), JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
        })
        await inserting((error) => {
            console.log(" Loacl MongoDbcollection.updateOne problem ", error);
        },
            LOCAL)

        // try {
        //     const mongoClient = await require('./db-mongo')();
        //     // const collection = mongoClient._db.collection(Eco3_COLLECTION);
        //     const data = await mongoClient._db.collection(Eco3_COLLECTION).updateOne(
        //         _query,
        //         _update,
        //         { upsert: true }
        //     )
        //     mongoClient.client.close();

        // } catch (error) {
        //     console.log(" collection.updateOne problem ", error);
        //     fs.writeFile('reserv/' + newRecord._id.replace(/:/g, '-'), JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
        // }
        // console.log("##DATA  insertNewHourRecordToMongo ", data);
    } catch (err) {
        console.log("#### FIND ERROR ", err);
    }
    //   const collection = client.db().collection("info");
}

// try {
//     main()
// } catch (error) {
//     console.log("main error ", error)
// }

module.exports = insertNewHourRecordToMongo;



