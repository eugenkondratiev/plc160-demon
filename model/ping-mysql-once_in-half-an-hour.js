
const dbQuery = require('./db').dbQuery;

async function pingMySql(_manager) {
    try {
        try {
            const rlt = await dbQuery("SELECT 1 FROM eco.hourseco3",);
            console.log("### mqsql Ping  result  - ", rlt);

        } catch (error) {
            console.log(" mqsql Ping  problem ", error);
        }

    } catch (err) {
        console.log("#### mqsql Ping  ERROR ", err);
    }
}


module.exports = pingMySql;



