const net = require('net');
module.exports = isPortReachable;

function isPortReachable(port, _options) {
    options = Object.assign({timeout: 3000}, _options);

    return new Promise( (resolve => {
        const socket = new net.Socket();
        const onError = (err) => {
            console.log(err ? err : "timoout");
            socket.destroy();
            resolve(false);
        };

        socket.setTimeout(options.timeout);
        socket.once('error', onError);
        socket.once('timeout', onError);

        socket.connect(port, options.host, () => {
            socket.end();
            resolve(true);
        });

    }));
}