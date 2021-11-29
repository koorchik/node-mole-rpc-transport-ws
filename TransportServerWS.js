const { WS_STATES, DEFAULT_PING_INTERVAL_MS } = require('./constants');
const { waitForWsOpening, addEventListenerToWs, sleep } = require('./utils');

const DEFAULT_WS_BUILDER_INTERVAL_MS = 1000;

class TransportServerWS {
    constructor({ wsBuilder, wsBuilderInterval, ping, pingInterval } = {}) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');

        this._wsBuilder = wsBuilder;
        this._wsBuilderInterval = Number(wsBuilderInterval) || DEFAULT_WS_BUILDER_INTERVAL_MS;
        this._pingEnabled = Boolean(ping);
        this._pingInterval = Number(pingInterval) || DEFAULT_PING_INTERVAL_MS;

        // Property left public to provide ws object access via [moleServer.currentTransport.ws]
        this.ws = null;

        this._onDataCallback = null;
        this._isTerminated = false;
        this._isWsBuilderLoopStarted = false;
    }

    async onData(callback) {
        this._onDataCallback = callback;

        this._startWsBuilderLoop();
    }

    terminate() {
        this._isTerminated = true;

        if (this.ws) {
            this.ws.terminate();
        }
    }

    async _startWsBuilderLoop() {
        if (this._isWsBuilderLoopStarted) {
            return;
        }

        this._isWsBuilderLoopStarted = true;

        while (true) {
            if (this._isTerminated) {
                break;
            }

            const isWsClosed = !this.ws || this.ws.readyState !== WS_STATES.OPEN;

            if (isWsClosed) {
                try {
                    const buildedWs = await this._buildWsInstance();

                    if (!buildedWs) {
                        break;
                    }

                    this.ws = buildedWs;
                } catch (error) {
                    // Ignore unexpected building errors
                }
            }

            await sleep(this._wsBuilderInterval);
        }
    }

    async _buildWsInstance() {
        const ws = await this._wsBuilder();

        if (!ws) {
            return null;
        }

        // If builder always returns the same object - there is no sense trying to build a new one
        if (ws === this.ws) {
            return null;
        }

        await waitForWsOpening(ws);

        this._applyMessageHandlerToWs(ws);
        this._applyPingPongHandlerToWs(ws);

        return ws;
    }

    _applyMessageHandlerToWs(ws) {
        const messageHandler = async (message) => {
            const data = message.data;
            const response = await this._onDataCallback(data);

            if (response) {
                ws.send(response);
            }
        };

        addEventListenerToWs(ws, 'message', messageHandler.bind(this));
    }

    async _applyPingPongHandlerToWs(ws) {
        if (!this._pingEnabled) {
            return;
        }

        let isConnectionAlive = false;

        addEventListenerToWs(ws, 'pong', () => {
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
}

module.exports = TransportServerWS;
