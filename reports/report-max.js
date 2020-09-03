const ReportMinParameter = require('./report-min');
//========================================================
//================Maximal parameter=======================
//========================================================
class ReportMaxParameter extends ReportMinParameter {
    constructor(pv) {
        super(pv);

    }

    //override handleNewValue !!!
    handleNewValue() {
        this._stored = this._pv > this._stored ? this._pv : this._stored
    }

}
module.exports = ReportMaxParameter
