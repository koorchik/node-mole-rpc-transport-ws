const MoleServer = require('mole-rpc/MoleServer');
const WebSocket = require('ws');

const TransportServerWSS = require('../../TransportServerWSS');
const { sum, multiply } = require('../mathFunctions');

const WSS_PORT = 12345;

async function main() {
    const server = new MoleServer({ transports: prepareTransports() });

    server.expose({ sum, multiply });
    await server.run();
}

function prepareTransports() {
    return [
        new TransportServerWSS({
            wss: new WebSocket.Server({
                port: WSS_PORT
            })
        })
    ];
}

main().catch(console.error);
