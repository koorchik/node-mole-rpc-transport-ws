const WsAdapter = require('./WsAdapter');
const readyState = require('./readyState');
const { sleep, waitForEvent } = require('./utils');

class TransportServerWS {
    constructor({ wsBuilder, ping, pingInterval = 10000, reconnectInterval = 1000 } = {}) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');
        this.wsBuilder = wsBuilder;
        this.ws = null;
        this.callback = null;
        this._onMessageHandler = null;
        this.isPingEnabled = ping;
        this.isTerminated = false;
        this.pingInterval = pingInterval;
        this.reconnectInterval = reconnectInterval;

        if (this.isPingEnabled) {
            this._timerId = null;
            this._isAlive = true;
            this._onPongHandler = () => {
                this._isAlive = true;
            }
        }
    }

    async onData(callback) {
        this.callback = callback;
        this._run();
    }

    async _run() {
        while (true) {
            try {
                if (!this.ws || this.ws.readyState !== readyState.OPEN) {
                    this.ws = await this._prepareWs();
                }
            } catch (error) {
                // Ignore unexpected errors
            }

            await sleep(this.reconnectInterval);

            if (this.isTerminated) {
                return;
            }
        }
    }

    async _prepareWs() {
        const buildedWs = await this.wsBuilder();

        const ws = WsAdapter.wrapIfRequired(buildedWs);

        if (this._onMessageHandler) {
            ws.off('message', this._onMessageHandler)
        }

        if (ws.readyState === readyState.CONNECTING) {
            await waitForEvent(ws, 'open');
        }

        this._onMessageHandler = async reqData => {
            const resData = await this.callback(reqData);

            if (!resData) return;

            ws.send(resData);
        }

        if (this.isPingEnabled && ws.ping) {
            ws.off('pong', this._onPongHandler)
            clearInterval(this._timerId);
            this._isAlive = true;

            this._timerId = setInterval(() => {
                if (!this._isAlive) {
                    ws.terminate();

                    return clearInterval(this._timerId);
                }

                this._isAlive = false;
                if(ws.readyState === readyState.OPEN) ws.ping();
            }, this.pingInterval);

            ws.on('pong', this._onPongHandler);
        }

        ws.on('message', this._onMessageHandler);

        return ws;
    }

    terminate(){
        this.isTerminated = true;
    }
}

module.exports = TransportServerWS;
