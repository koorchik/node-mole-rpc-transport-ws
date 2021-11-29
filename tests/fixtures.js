const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const TransportClientWS = require('../TransportClientWS');
const TransportServerWS = require('../TransportServerWS');
const WebSocket = require('ws');

const { waitForEvent } = require('./utils');

let WSS_PORT = 12345;

function getFreeWsConfig() {
    const wsPort = WSS_PORT++;
    const wsUrl = `ws://localhost:${wsPort}`;

    return { wsPort, wsUrl };
}

async function prepareTransportFixtures({ clientOptions = {}, serverOptions = {} }) {
    const { wsPort, wsUrl } = getFreeWsConfig();
    const websocketServer = new WebSocket.Server({ port: wsPort });

    let serverWs = null;
    let serverTransport = null;
    const serverMole = new MoleServer({ transports: [] });

    websocketServer.on('connection', ws => {
        serverWs = ws;
        serverTransport = new TransportServerWS({ wsBuilder: () => serverWs, ...serverOptions });

        serverMole.registerTransport(serverTransport);
    });

    const clientWs = new WebSocket(wsUrl);
    const clientTransport = new TransportClientWS({ wsBuilder: () => clientWs, ...clientOptions });
    const clientMole = new MoleClient({ transport: clientTransport });

    await waitForEvent(clientWs, 'open');

    return {
        clientWs,
        clientTransport,
        clientMole,
        serverWs,
        serverTransport,
        serverMole
    };
}

module.exports = {
    prepareTransportFixtures
};