
const dbPool = require('./connection-pool-eco')();
const dbQuery = require('./db').dbQuery;

// const { AVG, MIN, MAX } = require('../reports/report-constants');
const fs = require('fs');


const ROWS_ARRAY = [`dt`, `T_3`, `T_3min`, `T_3max`, `T_18`, `T_18min`, `T_18max`, `T_7`, `Q_39`, `P_6`, `P_8`, `P_9`, `T_5`, `KG_21`, `KG_22`, `KG_23`, `KG_28`, `P_11`, `P_12`, `P_13`, `T_19`, `P_30`];

function getDuplicateUpdateString(rows) {
    const keyupdate = (acc, key, index, arr) => {
        return acc + `  ${key} = VALUES(${key})` + (index < arr.length - 1 ? `,` : ``);
    }
    const noDate = [...rows];
    console.log("getDuplicateUpdateString rows ", rows.length, rows)
    noDate.shift();

    const ins = "INSERT INTO eco.hourseco3 (`dt`, `T_3`, `T_3min`, `T_3max`, `T_18`, `T_18min`, `T_18max`, `T_7`, `Q_39`, `P_6`, `P_8`, `P_9`, `T_5`, `KG_21`, `KG_22`, `KG_23`, `KG_28`, `P_11`, `P_12`, `P_13`, `T_19`, `P_30`) VALUES ? "
    const str = " ON DUPLICATE KEY UPDATE ";
    const dupStr = noDate.reduce(keyupdate, str);
    return ins + dupStr;
}

async function insertNewHourRecordToMysql(_manager) {
    try {
        const newRecord = _manager.formMySQLRecord();
        console.log("##DATA  formMySQLRecord ", newRecord.length, newRecord);
        try {
            const _sql = getDuplicateUpdateString(ROWS_ARRAY);
            const rlt = await dbQuery(_sql, [newRecord]);
            console.log("### dbQuery result  - ", rlt);

        } catch (error) {
            console.log(" insert hour query problem ", error);
            // fs.writeFile('reserv/' + newRecord._id.replace(/:/g,'-'), JSON.stringify(newRecord, null, " "), (err => { if (err) console.error }))
        }

    } catch (err) {
        console.log("#### insertNewHourRecordToMysql ERROR ", err);
    }
}


module.exports = insertNewHourRecordToMysql;



