const WsFactory = require('./WsFactory');
const { WS_STATES } = require('./constants');
const { sleep } = require('./utils');

const DEFAULT_WS_BUILDER_INTERVAL_MS = 1000;

class TransportServerWS {
    constructor({ wsBuilder, wsBuilderInterval, ping, pingInterval } = {}) {
        this._wsFactory = new WsFactory({ wsBuilder, ping, pingInterval });
        this._wsBuilderInterval = Number(wsBuilderInterval) || DEFAULT_WS_BUILDER_INTERVAL_MS;

        // Property left public to provide ws object access via [moleServer.currentTransport.ws]
        this.ws = null;

        this._isTerminated = false;
        this._isWsBuilderLoopStarted = false;
    }

    async onData(callback) {
        const messageHandler = async (data, ws) => {
            const response = await callback(data);

            if (response) {
                ws.send(response);
            }
        };

        this._wsFactory.setMessageHandler(messageHandler);
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
                    this.ws = await this._wsFactory.buildWsInstance();
                } catch (error) {
                    // If builder always returns the same object there is no sense trying to build a new one
                    if (error.code === 'WS_BUILDER_SAME_OBJECT') {
                        break;
                    }
                    // Ignore unexpected building errors
                }
            }

            await sleep(this._wsBuilderInterval);
        }
    }
}

module.exports = TransportServerWS;
