const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const WebSocket = require('ws');

const TransportClientWS = require('../TransportClientWS');
const TransportServerWS = require('../TransportServerWS');

const { WS_STATES } = require('../constants');
const { waitForEvent, initializeMoleClient } = require('./utils');

let WSS_PORT = 12345;

function getTestWsConfig() {
    const wsPort = WSS_PORT++;
    const wsUrl = `ws://localhost:${wsPort}`;

    return { wsPort, wsUrl };
}

async function createMoleServer(ws, options = {}) {
    const moleServer = new MoleServer({ transports: [] });
    const transport = new TransportServerWS({ wsBuilder: () => ws, ...options });

    await moleServer.registerTransport(transport);

    return moleServer;
}

async function createMoleClient(ws, options = {}) {
    const transport = new TransportClientWS({ wsBuilder: () => ws, ...options });
    const moleClient = new MoleClient({ transport });

    if (ws.readyState === WS_STATES.CONNECTING) {
        await waitForEvent(ws, 'open');
    }

    // Prepare ws with applied handlers
    initializeMoleClient(moleClient);

    return moleClient;
}

async function prepareTransportFixtures({ clientOptions, serverOptions }) {
    const { wsPort, wsUrl } = getTestWsConfig();
    const websocketServer = new WebSocket.Server({ port: wsPort });

    let serverWs = null;

    websocketServer.on('connection', async (ws) => {
        serverWs = ws;

        await createMoleServer(serverWs, serverOptions);
    });

    const clientWs = new WebSocket(wsUrl);

    await createMoleClient(clientWs, clientOptions);

    return { clientWs, serverWs };
}

module.exports = {
    getTestWsConfig,
    prepareTransportFixtures
};
