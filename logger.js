/**
 * just for me , I think
 */
const LOG_PATH = "d:/js/demon/Logs/";
const fs = require('fs');

module.exports = function (data) {

  const dt = (new Date()).toLocaleString("ru-UA",{year:"numeric", month:"2-digit", day:"2-digit"});
  const logFile = LOG_PATH + dt + ".log";


  const message = "\r\n- " + dt + " " + new Date().toLocaleTimeString("ru-UA",{hour:"2-digit", minute:"2-digit", second:"2-digit"}) + "-" + data;
  console.log(message);

  fs.appendFile(logFile, message, (err) => {
    if (err) console.log(err.message);
  });

}