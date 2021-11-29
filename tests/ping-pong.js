const { prepareTransportFixtures } = require('./fixtures');
const { test, sleep, assertWsOpened, assertWsClosed, simulateWsConnectionLoss } = require('./utils');

const PING_INTERVAL = 100;
const PING_HANDLING_DELAY = 300;

async function main() {
    console.log(`RUN ${__filename}`);

    await test('sometest', sometest);
    await test('sometesttwo', sometesttwo);
    await test('sometestthree', sometestthree);
    await test('sometestfour', sometestfour);
    await test('sometestfive', sometestfive);
}

async function sometest() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions: { ping: false },
        serverOptions: { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}

async function sometesttwo() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: false }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    // assertWsClosed(clientWs);
    assertWsOpened(serverWs);
}

async function sometestthree() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions: { ping: false },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsClosed(serverWs);
}

async function sometestfour() {
    const { clientWs, serverWs, serverTransport } = await prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    simulateWsConnectionLoss(clientWs);

    await sleep(PING_HANDLING_DELAY);

    // assertWsClosed(clientWs);
    assertWsClosed(serverWs);
}

async function sometestfive() {
    const { clientWs, serverWs } = await prepareTransportFixtures({
        clientOptions: { ping: true, pingInterval: PING_INTERVAL },
        serverOptions: { ping: true, pingInterval: PING_INTERVAL }
    });

    await sleep(PING_HANDLING_DELAY);

    assertWsOpened(clientWs);
    assertWsOpened(serverWs);
}


main().then(() => {
    process.exit();
}, console.error);
