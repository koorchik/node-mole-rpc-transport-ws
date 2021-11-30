const { WS_STATES, DEFAULT_WS_OPENING_TIMEOUT_MS, DEFAULT_PING_INTERVAL_MS } = require('./constants');
const { sleep } = require('./utils');
const { WsFactoryError } = require('./X');

class WsFactory {
    constructor({ wsBuilder, ping, pingInterval }) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');

        this._wsBuilder = wsBuilder;
        this._pingEnabled = Boolean(ping);
        this._pingInterval = Number(pingInterval) || DEFAULT_PING_INTERVAL_MS;

        this._messageHandler = null;
        this._lastBuildedWs = null;
    }

    setMessageHandler(messageHandler) {
        this._messageHandler = messageHandler;
    }

    async buildWsInstance() {
        const ws = await this._wsBuilder();

        if (!ws) {
            throw new WsFactoryError('WS_BUILDER_INVALID_OBJECT');
        }

        if (ws === this._lastBuildedWs) {
            throw new WsFactoryError('WS_BUILDER_SAME_OBJECT');
        }

        this._lastBuildedWs = ws;

        await this._waitForWsOpening(ws);

        this._applyMessageHandlerToWs(ws);
        this._applyPingPongHandlerToWs(ws);

        return ws;
    }

    async _waitForWsOpening(ws) {
        if (ws.readyState === WS_STATES.OPEN) {
            return;
        }

        if (ws.readyState !== WS_STATES.CONNECTING) {
            throw new WsFactoryError('WS_OPENING_ERROR', { reason: 'connection already closed' });
        }

        return new Promise((resolve, reject) => {
            let isOpened = false;

            this._addEventListenerToWs(ws, 'open', () => {
                isOpened = true;
                resolve();
            });

            this._addEventListenerToWs(ws, 'error', () => {
                reject(new WsFactoryError('WS_OPENING_ERROR', { reason: 'connection not established' }));
            });

            setTimeout(() => {
                if (!isOpened) {
                    reject(new WsFactoryError('WS_OPENING_ERROR', { reason: 'connection timeout' }));
                }
            }, DEFAULT_WS_OPENING_TIMEOUT_MS);
        });
    }

    _applyMessageHandlerToWs(ws) {
        this._addEventListenerToWs(ws, 'message', (data) => {
            this._messageHandler(data, ws);
        });
    }

    async _applyPingPongHandlerToWs(ws) {
        if (!this._pingEnabled || !ws.ping) {
            return;
        }

        if (ws.pingHandlerAlreadyApplied) {
            return;
        }

        // Handle same ws object usage for several transports
        ws.pingHandlerAlreadyApplied = true;

        let isConnectionAlive = false;

        this._addEventListenerToWs(ws, 'pong', () => {
            isConnectionAlive = true;
        });

        while (true) {
            if (ws.readyState !== WS_STATES.OPEN) {
                break;
            }

            isConnectionAlive = false;

            ws.ping();

            await sleep(this._pingInterval);

            if (!isConnectionAlive) {
                ws.terminate();
            }
        }
    }

    _addEventListenerToWs(ws, event, callback) {
        // Handle W3CWebSocket API
        if (ws.on) {
            ws.on(event, callback);
        } else {
            let wrappedCallback = callback;

            // Listener receives MessageEvent instance instead of data
            if (event === 'message') {
                wrappedCallback = (messageEvent) => callback(messageEvent.data);
            }

            ws.addEventListener(event, wrappedCallback);
        }
    }
}

module.exports = WsFactory;