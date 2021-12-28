const readyState = require('../readyState');

let WS_PORT = 12345;

function getTestWsConfig() {
    const wsPort = WS_PORT++;
    const wsUrl = `ws://localhost:${wsPort}`;

    return { wsPort, wsUrl };
}

async function test(label, callback) {
    try {
        await callback();

        console.log(`Test [${label}]: OK`);
    } catch (error) {
        console.log(`Test [${label}]: ERROR`, error);
    }
}

function assertEquals(firstArg, secondArg) {
    if (firstArg !== secondArg) {
        throw new Error(`Assert error: [${firstArg}] shoud be equal to [${secondArg}]`);
    }
}

function assertWsOpened(ws) {
    assertEquals(ws.readyState, readyState.OPEN);
}

function assertWsClosed(ws) {
    assertEquals(ws.readyState, readyState.CLOSED);
}

function simulateWsConnectionLoss(ws) {
    ws.pause();
}

function waitForEvent(emitter, eventName) {
    return new Promise(resolve => {
        emitter.on(eventName, (...args) => {
            resolve(args);
        });
    });
}

function sleep(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
}

module.exports = {
    getTestWsConfig,
    test,
    assertEquals,
    assertWsOpened,
    assertWsClosed,
    simulateWsConnectionLoss,
    waitForEvent,
    sleep
};