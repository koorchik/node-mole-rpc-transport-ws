const { prepareTransportFixtures } = require('./fixtures');
const { test, sleep, assertWsOpened, assertWsClosed, simulateWsConnectionLoss } = require('./utils');

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
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions : { ping: false },
        serverOptions : { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}

async function testPingDoesntBrakeStableConnection() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions : { ping: true, pingInterval: PING_INTERVAL },
        serverOptions : { ping: true, pingInterval: PING_INTERVAL }
    });

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}

async function testPingWorksForTranportClient() {
    const { clientWs } = await prepareTransportFixtures({
        clientOptions : { ping: true, pingInterval: PING_INTERVAL },
        serverOptions : { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(clientWs);
}

async function testPingWorksForTransportServer() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions : { ping: false },
        serverOptions : { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(serverWs);
}

async function testPingWorksForConcurrentTransports() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions : { ping: true, pingInterval: PING_INTERVAL },
        serverOptions : { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsClosed(clientWs);
    assertWsClosed(serverWs);
}


main().then(() => {
    process.exit();
}, console.error);
