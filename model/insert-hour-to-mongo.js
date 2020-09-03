

const Eco3_COLLECTION = "hourReportsEco3";
const Eco3_DB = "Eco";
const { AVG, MIN, MAX } = require('../reports/report-constants');
const fs = require('fs');

function formMongoRecord(reportManager) {
    const viewTable = reportManager._list.map(el => {
        return { [el.name + (el.type === MIN ? "min" : el.type === MAX ? "max" : "")]: el.par._lastHour }
    });
    const currentDateTime = new Date();
    const hh = currentDateTime.getHours();
    return {
        _id: currentDateTime.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 10) + " "
            + (hh > 9 ? hh : ("0" + hh)) + ":00:00",
        // + currentDateTime.toLocaleTimeString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 3) + "00:00",
        values: viewTable.reduce((acc, el) => {
            return { ...acc, ...el };
        }, {})
    }

}


function formSqlRecord(reportManager) {
    const hourRow = reportManager._list.map(el =>
        isFinite(el.par._lastHour) ? parseFloat(el.par._lastHour).toFixed(3) : "-"
    );
    const currentDateTime = new Date();
    const hh = currentDateTime.getHours();
    hourRow.unshift(currentDateTime.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 10) + " "
        + (hh > 9 ? hh : ("0" + hh)) + ":00:00")
    // + currentDateTime.toLocaleTimeString().slice(0, 3) + "00:00")
    return hourRow;
}

async function insertNewHourRecordToMongo(_manager) {


    try {
        const newRecord = formMongoRecord(_manager);
        console.log("##DATA  newRecord ", newRecord);
        console.log("##DATA  formSqlRecord ", formSqlRecord(_manager));
        try {
            const mongoClient = await require('./db-mongo')();
            // const collection = mongoClient._db.collection(Eco3_COLLECTION);
            const data = await mongoClient._db.collection(Eco3_COLLECTION).updateOne(
                { _id: newRecord._id },
                {
                    $set: {
                        _id: newRecord._id,
                        values: newRecord.values
                    }
                },
                { upsert: true }
            )
            mongoClient.client.close();

        } catch (error) {
            console.log(" collection.updateOne problem ", error);
            fs.writeFile('reserv/' + newRecord._id.replace(/:/g,'-'), JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
        }

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



