module.exports = readHourFromPlc;

//------------------------------------------
function getMainParameters(hourRow) {
    //   INSERT INTO `eco`.`hourseco1` 
    //(`id`, `dt`, `Q_39`, `T_41`, `T_42`, `P_19`, `P_18`, `P_36`, `T_10`, `T_6`, `T_7`, `T_4`, `W_38`) 
    //VALUES ('', '2019-10-25 11:00:00', '117.58', '64.0159', '53.4747', '0.345991', '0.380945', '-20.0209', '174.791', '1.98299', '68.6284', '72.7956', '61.6206', '1.18059');
    const arr = [hourRow[2]];//Q_39
    arr.push(hourRow[20]);//T_41
    arr.push(hourRow[23]);//T_42
    arr.push(hourRow[25]);//P_19
    arr.push(hourRow[24]);//P_18
    arr.push(hourRow[0]); // P_36
    arr.push(hourRow[18]); // T_10
    arr.push(hourRow[26]); // T_6
    arr.push(hourRow[7]); // T_7
    arr.push(hourRow[12]); // T_4
    arr.push(hourRow[1]); // W_38
    // console.log("arr   -" , arr)
    return arr.map(el => el.toFixed(6));
}
//------------------------------------------

function readHourFromPlc(_client, _hour, _last) {
    return new Promise((res, rej) => {

        //   console.log(_client);  
        const BLOCK_START = 3200;
        const BLOCK_SIZE = 100;

        // const LAST_DAY_BLOCK_START = 7000;
        // const CURRENT_DAY_BLOCK_START = 9400;
        const LAST_DAY_BLOCK_START = 9400;
        const CURRENT_DAY_BLOCK_START = 7000;
        const HOUR_BLOCK_SIZE = 100;

        const m340 = require('../m340read');

        setTimeout(function () {
            try {
                const curHour = _hour || 10;
                // console.log("hour", curHour);

                // const hoursArray = _hour == 7 ? LAST_DAY_BLOCK_START : CURRENT_DAY_BLOCK_START;
                const hoursArray = (_hour == 7 || _last) ? LAST_DAY_BLOCK_START : CURRENT_DAY_BLOCK_START;

                const lastHourStart = hoursArray + HOUR_BLOCK_SIZE * curHour;

                _client.readHoldingRegisters(lastHourStart, BLOCK_SIZE)
                    .then(data => {
                        const _answer = data.data;
                        const floats = m340.getFloatsFromMOdbusCoils(_answer);
                        // console.log("last hour  - ",curHour, floats.slice(0, 5));
                        //get only what needed;
                        const sqlData = getMainParameters(floats);
                        res(sqlData);
                    })
                    .catch(err => {
                        if (err) {
                            console.log("read.error", err);
                            rej(err.message)
                        };

                    })
            } catch (error) {
                rej(error.message)
            };
        }, 500)
    })
}