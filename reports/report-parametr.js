const { EventEmitter } = require('events');
//========================================================
//================Average parameter=======================
//========================================================
class ReportParameter extends EventEmitter {
    constructor(pv) {
        super();
        
        this.resetValues(pv);
        this.handleNewValue();

        this.on('value', (newPv) => {
            // console.log("## new PV", newPv);
            this._pv = parseFloat(newPv) || this._pv;
            this._seconds++;
            this.handleNewValue()
        });

        this.on('hour', () => {
            console.log("## new hour");
            this.handleNewHour();
            this._seconds = 0
        })

    }

    handleNewValue() { 
        this._stored += this._pv;     
    }
    handleNewHour() {
        this._lastHour = this._stored / this._seconds;
        this._stored = 0;
    }

    resetValues(pv) {
        this._pv = parseFloat(pv) || 0;
        this._stored = this._pv;
        this._seconds = 0;
        this._lastHour = 0; 
    }
}

module.exports = ReportParameter;