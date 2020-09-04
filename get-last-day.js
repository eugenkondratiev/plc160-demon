
function getLastDayString() {
    const lastDay = (new Date(new Date() - 24 * 3600000));
    return lastDay.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }).slice(0, 10);
}
function getCurrentDayString() {
    return (new Date()).toLocaleString().slice(0, 10);
}

function getHourString(_lastDay) {
    // console.log(_lastDay);

    return _hour => {
        return `${_lastDay} ${_hour > 9 ? _hour : "0" + _hour}:00:00`
    }
}
const getLastDayHourString = getHourString(getLastDayString());
const getCurrentDayHourString = getHourString(getCurrentDayString());
function getCurrentLocalDateTime() {
    const currentDateTime = new Date();
    return currentDateTime.toLocaleString("ru-UA", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " 
        + currentDateTime.toLocaleTimeString("ru-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
module.exports = {
    getLastDayHourString: getLastDayHourString,
    getLastDayString: getLastDayString,
    getCurrentDayHourString: getCurrentDayHourString,
    getCurrentLocalDateTime: getCurrentLocalDateTime
}





