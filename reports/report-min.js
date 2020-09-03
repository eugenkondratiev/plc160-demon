const ReportParameter = require('./report-parametr');
//========================================================
//================Minimal parameter=======================
//========================================================
class ReportMinParameter extends ReportParameter {
    constructor(pv) {
        super(pv);

    }

    //override handleNewValue !!!
    handleNewValue() {
        this._stored = this._pv < this._stored ? this._pv : this._stored
    }

    //override handleNewHour !!!
    handleNewHour() {
        this._lastHour = this._stored;
        this._stored = this._pv
    }
}

module.exports = ReportMinParameter