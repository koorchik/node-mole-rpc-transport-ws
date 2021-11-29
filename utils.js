const { WS_STATES, DEFAULT_WS_OPENING_TIMEOUT_MS } = require('./constants');

function waitForWsOpening(ws, timeoutMs = DEFAULT_WS_OPENING_TIMEOUT_MS) {
    if (ws.readyState === WS_STATES.OPEN) {
        return;
    }

    if (ws.readyState !== WS_STATES.CONNECTING) {
        throw new Error('Some error');
    }

    return new Promise((resolve, reject) => {
        let isOpened = false;

        addEventListenerToWs(ws, 'open', () => {
            isOpened = true;
            resolve();
        });

        addEventListenerToWs(ws, 'error', () => {
            reject(new Error('Some error'));
        });

        setTimeout(() => {
            if (!isOpened) {
                reject(new Error('Some error'));
            }
        }, timeoutMs);
    });
}

function addEventListenerToWs(ws, event, callback) {
    // Handle W3CWebSocket API
    if (ws.on) {
        ws.on(event, callback);
    } else {
        ws.addEventListener(event, callback);
    }
}

function sleep(delayMs) {
    return new Promise(resolve => {
        setTimeout(resolve, delayMs);
    });
}


module.exports = {
    waitForWsOpening,
    addEventListenerToWs,
    sleep
};
