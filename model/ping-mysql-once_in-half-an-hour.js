
const dbQuery = require('./db').dbQuery;

async function pingMySql(_manager) {
    try {
        try {
            const rlt = await dbQuery("SELECT 1 FROM eco.hourseco3",);
            console.log("### dbQuery result  - ", rlt);

        } catch (error) {
            console.log(" insert hour query problem ", error);
        }

    } catch (err) {
        console.log("#### insertNewHourRecordToMysql ERROR ", err);
    }
}


module.exports = pingMySql;



