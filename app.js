
const TcpPort = require("modbus-serial").TcpPort;
const tcpPort = new TcpPort("192.168.1.229");
const ModbusRTU = require("modbus-serial");
const client = new ModbusRTU(tcpPort);
const LAST_DAY = true;

const PLC_PORT = 4001;

const BLOCK_START = 0;
const BLOCK_SIZE = 62;
const FLOATS_BLOCK_SIZE = 58;
const INT_DATA = [29, 30, 31, 32];
const M340_NO_CONNECTION = FLOATS_BLOCK_SIZE + INT_DATA.length;

const DATA_SEND_DELAY = 2000;
const PLC_RECONNECT_DELAY = 180000;
const SERVER_RECONNECT_DELAY = 15000;
const REACHABLE_PORT_TIMEOUT = 5000;
const DATA_COLLECT_PERIOD = 1000;

const m340 = require('./m340read');
const bits = require('./bit-operations');
bits.addBinFunctions();

const logIt = require("./logger");
const readHourFromPlc = require('./controller/read-hour-from_plc');

const { getCurrentLocalDateTime, getLastDayString: getLastDay, getLastDayHourString } = require('./get-last-day');

// const getLastDayEco1 = require('./controller/update-last-day-test');

global.m340data = [...Array(M340_NO_CONNECTION)];
function connectPLC() {
    client.connectTCP("192.168.1.229", { port: PLC_PORT })
        .then(() => {
            client.setID(5);
        })
        .catch((err) => {
            console.log(`PLC connection error ${getCurrentLocalDateTime()} ----  `, err.message);
            setTimeout(connectPLC, PLC_RECONNECT_DELAY)
        });
}

connectPLC();

handler = setInterval(function () {
    //PromiseAPI
    client.readHoldingRegisters(BLOCK_START, BLOCK_SIZE)
        .then(data => {

            const _answer = data.data;
            const floats = m340.getFloatsFromMOdbusCoils(_answer.slice(0, FLOATS_BLOCK_SIZE));
            floats.forEach((fl, i) => {
                m340data[i] = fl
            });
            INT_DATA.forEach(i => {
                m340data[i] = _answer[i + 29];
            })
        })
        .catch(err => {
            // console.log(" readHoldingRegisters ERROR", err);
            m340data = m340data.map(i => null);
        });
}, DATA_COLLECT_PERIOD);

setTimeout(async () => {
    try {
        await require('./reports/reports-manager')();
    } catch (error) {
        console.log('reports manager problem ',)
    }
}, 5000);
//==================================================================================================

const WebSocketClient = require('websocket').client;

const demon = new WebSocketClient({ closeTimeout: 120000 });
demon.on('connectFailed', function (error) {
    logIt('Connect Error: ' + error.toString());
    process.exit();
});



demon.on('connect', function (connection) {
    logIt("demon.connect('ws://95.158.47.15:8081');");
    connection.on('error', function (error) {
        logIt("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        logIt('echo-protocol Connection Closed', connection.state);
        process.exit();
    });
    connection.on('message', async function (message) {
        logIt("Received msg type: '" + message.type + "'");

        if (message.type === 'utf8') {
            // TODO: receive necessery parameters list
            logIt("Received: '" + message.utf8Data + "'");
            const msg = JSON.parse(message.utf8Data);
            if (msg.lastDayUpdate && msg.eco == 3) {
                // const dayDataEco1 = await getLastDayEco1();
                const answer = [];
                for (let i = 0; i < 24; i++) {
                    const resp = await readHourFromPlc(client, i, LAST_DAY);
                    resp.unshift(getLastDayHourString(i));
                    console.log("resp " + i + " ", resp);
                    answer.push(resp)
                }
                logIt("Handled day data Eco3 Day: '" + JSON.stringify(answer) + "\n'");

                // logIt("Handled day data: '" + JSON.stringify(dayDataEco1) + "'");

                let outgoingMessage = JSON.stringify({ lastDayEco3: answer, timestamp: new Date() }).toString();
                // let outgoingMessage = JSON.stringify({ lastDayEco1: dayDataEco1, timestamp: new Date() }).toString();
                console.log("outgoingMessage   ", outgoingMessage);
                connection.sendUTF(outgoingMessage);
            }
        }
    });

    function sendNumber() {
        if (connection.connected) {

            const dataarr = m340data.map((el, index) => Number.isFinite(el) ? (index < 30 ? el.toFixed(2) : el) : " - ");
            const dt = new Date();
            let outgoingMessage = JSON.stringify({ eco3: dataarr, timestamp: dt }).toString();
            connection.sendUTF(outgoingMessage);
            let handler = setTimeout(sendNumber, DATA_SEND_DELAY);
        }
    }
    dataHandler = sendNumber();
});


const isPortReahable = require('./is-port-reachable');

function reCall() {

    isPortReahable(8081, { host: '95.158.47.15', timeout: REACHABLE_PORT_TIMEOUT })
        .then(isTrue => {
            if (isTrue) {
                // logIt("demon.connect('ws://95.158.47.15:8081');");
                demon.connect('ws://95.158.47.15:8081');
            } else {
                logIt("Can not connect. Another try;");
                setTimeout(reCall, SERVER_RECONNECT_DELAY);
            }
        })
        .catch(err => {
            console.log("error :", err);

        });

}


reCall();

//logIt("demon.connect('ws://95.158.47.15:8081');");

