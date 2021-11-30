const { WS_STATES } = require('../constants');

async function test(label, callback) {
    try {
        await callback();

        console.log(`  ${label}: OK`);
    } catch (error) {
        console.log(`  ${label}: ERROR`, error);
    }
}

function assertEquals(firstArg, secondArg) {
    if (firstArg !== secondArg) {
        throw new Error(`Assert error: [${firstArg}] shoud be equal to [${secondArg}]`);
    }
}

function waitForEvent(emitter, eventName) {
    return new Promise(resolve => {
        emitter.on(eventName, (...args) => {
            resolve(args);
        });
    });
}

function sleep(timeoutMs) {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

function assertWsOpened(ws) {
    assertEquals(ws.readyState, WS_STATES.OPEN);
}

function assertWsClosed(ws) {
    assertEquals(ws.readyState, WS_STATES.CLOSED);
}

function simulateWsConnectionLoss(ws) {
    ws.pause();
}

function initializeMoleClient(moleClient) {
    // Mole client is initialized on first call
    moleClient.callMethod('test', []).catch(() => {});
}

module.exports = {
    test,
    assertEquals,
    waitForEvent,
    sleep,
    assertWsOpened,
    assertWsClosed,
    simulateWsConnectionLoss,
    initializeMoleClient
};