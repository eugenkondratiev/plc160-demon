
const TcpPort = require("modbus-serial").TcpPort;
const tcpPort = new TcpPort("192.168.1.229");
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU(tcpPort);
const LAST_DAY = true;

const BLOCK_START = 0;
const BLOCK_SIZE = 62;
const FLOATS_BLOCK_SIZE = 58;
const INT_DATA = [29,30,31,32];
const DATA_DELAY = 2000;

const m340 = require('./m340read');
const bits = require('./bit-operations');
bits.addBinFunctions();

const logIt = require("./logger");
const readHourFromPlc = require('./controller/read-hour-from_plc');
const getLastDayHourString = require('./get-last-day').getLastDayHourString;
const getLastDay = require('./get-last-day').getLastDayString;

// const addresses = [0, 10, 18, 19, 21, 43, 44, 45, 46, 47, 52, 54, 55, 17, 34, 35, 39, 51, 31, 7];
// const parameters = ["eco1LastDayW38", "T_10", "P_22", "P_21", "P_34", "T_41", "T_42", "P_36",
//     "W_38", "Q_39", "EI_86", "P_19", "EI_82", "P_23", "meo_92", "meo_93", "meo_97", "EI_83", "EI_74", "T_7"];
//temporary in 2 arrays
const getLastDayEco1 = require('./controller/update-last-day-test');

let m340data = [];
client.connectTCP("192.168.1.229", { port: 4001 });
client.setID(5);

handler = setInterval(function () {


    //PromiseAPI
    client.readHoldingRegisters(BLOCK_START, BLOCK_SIZE)
        .then(data => {

            const _answer = data.data;
            // console.log(_answer);

            const floats = m340.getFloatsFromMOdbusCoils(_answer.slice(0,FLOATS_BLOCK_SIZE));
            // console.log(floats);

            // addresses.forEach((addr, index) => {
            //     m340data[index] = floats[addr];
            // });
            floats.forEach((fl,i)=>{
                m340data[i] = fl
            });
            INT_DATA.forEach(i=>{
                m340data[i] = _answer[i+29];
            })
            

            // console.log(m340data, m340data.length);


        })
        .catch(err => console.log(err));
}, 2000);
//==================================================================================================

const WebSocketClient = require('websocket').client;

const demon = new WebSocketClient({ closeTimeout: 120000 });
demon.on('connectFailed', function (error) {
    logIt('Connect Error: ' + error.toString());
    //console.log('Connect Error: ' + error.toString());
    // recallingFlag = permanentRecall();
    process.exit();
});



demon.on('connect', function (connection) {
    //   console.log('WebSocket Client Connected');
    logIt("demon.connect('ws://95.158.47.15:8081');");
    connection.on('error', function (error) {
        logIt("Connection Error: " + error.toString());
        // console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        logIt('echo-protocol Connection Closed', connection.state);
        //        console.log('echo-protocol Connection Closed', connection.state);
        process.exit();
    });
    connection.on('message', async function (message) {
        logIt("Received msg type: '" + message.type + "'");

        if (message.type === 'utf8') {
            // TODO: receive necessery parameters list
            logIt("Received: '" + message.utf8Data + "'");
            const msg = JSON.parse(message.utf8Data);
            if (msg.lastDayUpdate) {
                // const dayDataEco1 = await getLastDayEco1();

                const answer = [];
                for (let i = 0; i < 24; i++) {
                    const resp = await readHourFromPlc(client, i, LAST_DAY);
                    resp.unshift(getLastDayHourString(i));
                    console.log("resp " + i + " ", resp);
                    answer.push(resp)
                }
                logIt("Handled day data Eco1 Day: '" + JSON.stringify(answer) + "\n'");

                // logIt("Handled day data: '" + JSON.stringify(dayDataEco1) + "'");

                let outgoingMessage = JSON.stringify({ lastDayEco3: answer, timestamp: new Date() }).toString();
                // let outgoingMessage = JSON.stringify({ lastDayEco1: dayDataEco1, timestamp: new Date() }).toString();
                console.log("outgoingMessage   ", outgoingMessage);
                connection.sendUTF(outgoingMessage);
            }
            // console.log("Received: '" + message.utf8Data + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            //console.log("connection.connected", connection.connected);
            //logIt("connection.connected", connection.connected);

            const dataarr = m340data.map((el,index) => Number.isFinite(el) ? (index < 30 ? el.toFixed(2) : el ): " - ");
            const dt = new Date();
            let outgoingMessage = JSON.stringify({ eco3: dataarr, timestamp: dt }).toString();
            //    console.log("outgoingMessage", outgoingMessage)
            // logIt("outgoingMessage", outgoingMessage)
            connection.sendUTF(outgoingMessage);
            let handler = setTimeout(sendNumber, DATA_DELAY);
        }
    }
    dataHandler = sendNumber();
});


const isPortReahable = require('./is-port-reachable');

function reCall() {

    isPortReahable(8081, { host: '95.158.47.15', timeout: 5000 })
        .then(isTrue => {
            if (isTrue) {
                // logIt("demon.connect('ws://95.158.47.15:8081');");
                demon.connect('ws://95.158.47.15:8081');
            } else {
                logIt("Can not connect. Another try;");
                setTimeout(reCall, 15000);
            }
        })
        .catch(err => {
            console.log("error :", err);

        });

}


reCall();

//logIt("demon.connect('ws://95.158.47.15:8081');");

