const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const TransportClientWS = require('../TransportClientWS');
const TransportServerWS = require('../TransportServerWS');
const WebSocket = require('ws');

const { waitForEvent, initializeMoleClient } = require('./utils');
const { WS_STATES } = require('../constants');

const AUTOTESTER_REQUEST_TIMEOUT = 1000;

let WSS_PORT = 12345;

function getTestWsConfig() {
    const wsPort = WSS_PORT++;
    const wsUrl = `ws://localhost:${wsPort}`;

    return { wsPort, wsUrl };
}

async function createMoleServer(ws, options = {}) {
    const moleServer = new MoleServer({ transports: [] });
    const transportServer = new TransportServerWS({ wsBuilder: () => ws, ...options });

    await moleServer.registerTransport(transportServer);

    return { moleServer, transportServer };
}

async function createMoleClient(ws, options = {}) {
    const transportClient = new TransportClientWS({ wsBuilder: () => ws, ...options });
    const moleClient = new MoleClient({ requestTimeout: AUTOTESTER_REQUEST_TIMEOUT, transport: transportClient });

    if (ws.readyState === WS_STATES.CONNECTING) {
        await waitForEvent(ws, 'open');
    }

    // Prepare ws with applied handlers
    initializeMoleClient(moleClient);

    return { moleClient, transportClient };
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

async function prepareDuplexTransportFixtures({ clientOptions, serverOptions }) {
    const { wsPort, wsUrl } = getTestWsConfig();
    const websocketServer = new WebSocket.Server({ port: wsPort });

    let serverWs = null;

    websocketServer.on('connection', async (ws) => {
        serverWs = ws;

        await createMoleServer(serverWs, serverOptions);
        await createMoleClient(serverWs, clientOptions);
    });

    const clientWs = new WebSocket(wsUrl);

    await createMoleClient(clientWs, clientOptions);
    await createMoleServer(clientWs, serverOptions);

    return { clientWs, serverWs };
}

module.exports = {
    getTestWsConfig,
    prepareTransportFixtures,
    prepareDuplexTransportFixtures
};