const WebSocket = require('ws');
const MoleClient = require('mole-rpc/MoleClient');
const MoleServer = require('mole-rpc/MoleServer');
const readyState = require('./../readyState');
const {
    getTestWsConfig,
    test,
    assertWsOpened,
    assertWsClosed,
    simulateWsConnectionLoss,
    waitForEvent,
    sleep
} = require('./utils');

const TransportClientWS = require('../TransportClientWS');
const TransportServerWS = require('../TransportServerWS');

const PING_INTERVAL = 100;
const PING_HANDLING_DELAY = 300;

async function main() {
    console.log(`RUN ${__filename}`);

    await test('testWsDoesntHandleConnectionLossWithoutPing', testWsDoesntHandleConnectionLossWithoutPing);
    await test('testPingDoesntBrakeStableConnection', testPingDoesntBrakeStableConnection);
    await test('testPingWorksForTranportClient', testPingWorksForTranportClient);
    await test('testPingWorksForTransportServer', testPingWorksForTransportServer);
    await test('testPingWorksForConcurrentTransports', testPingWorksForConcurrentTransports);
}

async function testWsDoesntHandleConnectionLossWithoutPing() {
    const { clientWs, serverWs } = await _prepareTransportFixtures({
        clientOptions: { ping: false },
        serverOptions: { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}

async function testPingDoesntBrakeStableConnection() {
    const { clientWs, serverWs } = await _prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}

async function testPingWorksForTranportClient() {
    const { clientWs } = await _prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(clientWs);
}

async function testPingWorksForTransportServer() {
    const { clientWs, serverWs } = await _prepareTransportFixtures({
        clientOptions: { ping: false },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(serverWs);
}

async function testPingWorksForConcurrentTransports() {
    const { clientWs, serverWs } = await _prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(clientWs);
    assertWsClosed(serverWs);
}

async function _prepareTransportFixtures({ clientOptions, serverOptions }) {
    const { wsPort, wsUrl } = getTestWsConfig();
    const websocketServer = new WebSocket.Server({ port: wsPort });

    let serverWs = null;

    websocketServer.on('connection', async (ws) => {
        serverWs = ws;

        await _createMoleServer(serverWs, serverOptions);
    });

    const clientWs = new WebSocket(wsUrl);

    await _createMoleClient(clientWs, clientOptions);

    return { clientWs, serverWs };
}

async function _createMoleServer(ws, options = {}) {
    const moleServer = new MoleServer({ transports: [] });
    const transport = new TransportServerWS({ wsBuilder: () => ws, ...options });

    await moleServer.registerTransport(transport);

    return moleServer;
}

async function _createMoleClient(ws, options = {}) {
    const transport = new TransportClientWS({ wsBuilder: () => ws, ...options });
    const moleClient = new MoleClient({ transport });

    if (ws.readyState === readyState.CONNECTING) {
        await waitForEvent(ws, 'open');
    }

    // Make sure that ping-pong handlers applied (mole client is initialized on first call)
    moleClient.callMethod('test', []).catch(() => { });

    return moleClient;
}

main().then(() => {
    process.exit();
}, console.error);