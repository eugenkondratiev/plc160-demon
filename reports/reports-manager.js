const ReportParametr = require('./report-parametr')
const ReportMinParametr = require('./report-min')
const ReportMaxParametr = require('./report-max')

const { AVG, MIN, MAX } = require('./report-constants');
const m340read = require('../m340read');
const fs = require('fs');

const { getReportParametrsList, getParametrValue, getReportsArray } = require('../model/get-parameters');
// const { CLIENT_RENEG_LIMIT } = require('tls');
// 

class ReportManager {
    constructor(_reportsArray) {

        this._list = _reportsArray.map(p => {
            const _par = { name: p.parametr };

            const pv = getParametrValue(p.parametr);
            _par.type = p.type;
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
        setTimeout(() => {
            ;
        }, 0)
    }
    formMySQLRecord() {
        const DELETED_PARAMETERS_START = 16;
        const newList = [...this._list];
        newList.splice(DELETED_PARAMETERS_START, 3);
        const hourRow = newList.map(el =>
            isFinite(el.par._lastHour) ? parseFloat(el.par._lastHour).toFixed(3) : "-"
        );
        const currentDateTime = new Date();
        const hh = currentDateTime.toLocaleTimeString("ru-UA", { hour: "2-digit" }).slice(0, 3) + ":00:00";
        hourRow.unshift(currentDateTime.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 10) + " " + hh)
        return hourRow;
    }
    formMongoDbRecord() {
        const viewTable = this._list.map(el => {
            return { [el.name + (el.type == MIN ? "min" : el.type == MAX ? "max" : "")]: el.par._lastHour }
        });
        const currentDateTime = new Date();
        const hh = currentDateTime.toLocaleTimeString("ru-UA", { hour: "2-digit" }).slice(0, 3) + ":00:00";
        return {
            _id: currentDateTime.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 10) + " " + hh,
            values: viewTable.reduce((acc, el) => {
                return { ...acc, ...el };
            }, {})
        }
    }
}

async function main() {
    try {
        const parametrs = await getReportParametrsList();
        console.log(getParametrValue("T_3"));
        let reportsArray;
        try {
            reportsArray = await getReportsArray();
        } catch (error) {
            console.log("## getReportsArray ERROR ", error)
        }
        const manager = new ReportManager(reportsArray);
        const schedule = require('node-schedule');
        const rule = new schedule.RecurrenceRule();
        // const rule = new schedule.RecurrenceRule({minute:0, second:0});
        rule.minute = 0;
        rule.second = 0;

        const ruleHalfAnHour = new schedule.RecurrenceRule();
        // const rule = new schedule.RecurrenceRule({minute:0, second:0});
        ruleHalfAnHour.minute = [25, 55];
        ruleHalfAnHour.second = 14;

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
            console.table(viewTable);
        }
        const schHandlerHalfHour  = schedule.scheduleJob( ruleHalfAnHour, async ()=>{
            try {
                await require('../model/ping-mysql-once_in-half-an-hour')();
                
            } catch (error) {
                console.log("  ping mysql problem ", error);
                
            };
        })
        const schHandler = schedule.scheduleJob(rule, async () => {
            console.log('New hour, i think !  ', (new Date()).toUTCString);
            try {
                manager.handleNewHour();
                showViewTable();
                try {
                    await require('../model/insert-hour-to-mongo')(manager);
                } catch (error) {
                    console.log("  insert-hour-to-mongo problem ", error);
                }
                try {
                    await require('../model/insert-hour-to-mysql')(manager);
                } catch (error) {
                    console.log("  insert-hour-to-mysql problem ", error);
                }
            } catch (error) {
                console.log("  hour handle main problem ", error);
            }
        });
        setInterval(() => {
            manager.updateCurrentValues();
        }, 1000)
        setTimeout(() => {
            require('../model/insert-hour-to-mysql')(manager).catch(err => (console.error("model/insert-hour-to-mysql error ", err)));
        }, 7000)
    } catch (error) {
        console.log("## main ERROR ", error)
    }
}
// main();
module.exports = main;
