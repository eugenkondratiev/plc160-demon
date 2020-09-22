// const testReportsArray = [
//     { parametr: "T_3", type: 0 },
//     { parametr: "T_3", type: 1 },
//     { parametr: "T_3", type: 2 },
//     { parametr: "T_5", type: 0 },
//     { parametr: "P_6", type: 0 },
//     { parametr: "P_9", type: 0 },
// ]

let parametrs;
let reportsArray;
const fs = require('fs');
const logIt = require('../logger');

// const util = require('util');
// const readFilePromis = util.promisify(fs.readFile, { encoding: 'utf-8'});

function getParametrValue(parametrName) {
    const parametr = parametrs.eco3[parametrName];
    return parametr
        ? m340data[parametr.index]
        : NaN
}

async function getReportParametrsList() {
    if (parametrs) {
        return parametrs
    } else {
        parametrs = await require('../data/read-parameters').getLists();
        // console.log("####  pars", parametrs);
        return parametrs
    }
}

function getReportsArray() {
    return new Promise((res,rej)=>{
        if (!reportsArray) {
            fs.readFile('data/reports.json', {encode:null}, (err, data) => {
                if (err) { 
                    rej([]) ;
                    logIt(" ##### getReportsArray() read FILE PRONBLEM  ", err)
                } else {
                    // console.log("data - ",  data)
                    reportsArray = JSON.parse(data).list;
                    res(reportsArray)
                 }

            })
        } else {
            res(reportsArray)
        }
    })   
}

module.exports = {
    getReportParametrsList: getReportParametrsList,
    getParametrValue: getParametrValue,
    getReportsArray: getReportsArray,

}