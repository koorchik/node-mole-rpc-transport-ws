const MoleServer = require('mole-rpc/MoleServer');
const WebSocket = require('ws');

const TransportServerWS = require('../../TransportServerWS');
const { sum, multiply } = require('../mathFunctions');
const { sleep } = require('../../utils');

const WSS_PORT = 12345;

async function main() {
    const server = new MoleServer({ transports: [] });

    server.expose({ sum, multiply });
    await server.run();

    // you can connect to other client with the same server
    // in this example we introduce this server twice to our remote client
    await server.registerTransport(prepareTransport());
    await server.registerTransport(prepareTransport());
}

function prepareTransport() {
    return new TransportServerWS({
        wsBuilder: () => new WebSocket(`ws://localhost:${WSS_PORT}`)
    });
}

main().catch(console.error);
