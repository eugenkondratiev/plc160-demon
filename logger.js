/**
 * just for me , I think
 */
const LOG_PATH = "d:/js/demon/Logs/";
const fs = require('fs');

module.exports = function (data) {

  const dt = new Date();
  const logName = dt.toLocaleString().slice(0, -9) + ".log";
  const logFile = LOG_PATH + logName;

  console.log(dt.toLocaleDateString(), " ", dt.toLocaleTimeString(), ' ', data);

  const message = "\r\n- " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString() + "-" + data;
  fs.appendFile(logFile, message, (err) => {
    if (err) console.log(err.message);
  });

}