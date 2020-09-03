const ReportParametr = require('./report-parametr')
const ReportMinParametr = require('./report-min')
const ReportMaxParametr = require('./report-max')

const { AVG, MIN, MAX } = require('./report-constants');
const m340read = require('../m340read');
const fs = require('fs');

// const _reports = [...Array(15)].map((p,i)=>[i, Math.random(100)]);
// console.log(_reports);

const { getReportParametrsList, getParametrValue, getReportsArray } = require('../model/get-parameters');


class ReportManager {
    constructor(_reportsArray) {

        this._list = _reportsArray.map(p => {
            const _par = { name: p.parametr };

            const pv = getParametrValue(p.parametr);

            switch (p.type) {
                case MIN:
                    _par.par = new ReportMinParametr(pv)
                    break;
                case MAX:
                    _par.par = new ReportMaxParametr(pv)
                    break;
                default:
                    _par.par = new ReportParametr()
                    break;
            }

            return _par
        })
    }

    updateCurrentValues() {
        this._list.forEach(element => {
            element.par.emit('value', getParametrValue(element.name))
        });
    }

    handleNewHour() {
        this._list.forEach(element => {
            element.par.emit('hour')
        });
    }
    formMySQLRecord() {
        ;
    }
    formMongoDbRecord() {
        ;
    }

}


async function main() {

    try {
        const parametrs = await getReportParametrsList();
        // console.log("####  pars", parametrs);

        console.log(getParametrValue("T_3"));
        let reportsArray;
        try {
            reportsArray = await getReportsArray();
            console.log("!!!! ####  reportsArray main ", reportsArray);
        } catch (error) {
            console.log("## getReportsArray ERROR ", error)
        }


        const manager = new ReportManager(reportsArray);
        const schedule = require('node-schedule');

        const rule = new schedule.RecurrenceRule();
        rule.minute = 0;
        rule.seconds = 0;

        function showViewTable() {
            const viewTable = manager._list.map(el => {
                return {
                    name: el.name,
                    value: el.par._pv,
                    stored: el.par._stored,
                    lastHour: el.par._lastHour,
                    seconds: el.par._seconds
                }
            });
            // console.log("####  MANAGER  --- ", Array.isArray(viewTable));
            console.table(viewTable);
        }

        const schHandler = schedule.scheduleJob(rule, async () => {
            console.log('TNew hour i think !  ', (new Date()).toUTCString);
            try {
                manager.handleNewHour();
                showViewTable();
                await require('../model/insert-hour-to-mongo')();
            } catch (error) {
                console.log("  hour handle main problem ", error);
            }

        });

        setInterval(() => {
            manager.updateCurrentValues();
            // console.log(manager._list);
            // showViewTable()
        }, 1000)

    } catch (error) {
        console.log("## main ERROR ", error)
    }

}


main();
