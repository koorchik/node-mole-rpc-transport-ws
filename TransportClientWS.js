const { WS_STATES } = require('./constants');
const { waitForWsOpening } = require('./utils');

class TransportClientWS {
    constructor({ wsBuilder, ping, pingInterval = 10000 } = {}) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');
        this.wsBuilder = wsBuilder;
        this.ws = null;
        this.callback = null
        this.isPingEnabled = ping;
        this.pingInterval = pingInterval;

        if (this.isPingEnabled) {
            this._timerId = null;
            this._isAlive = true;
            this._onPongHandler = () => {
                console.log('RECEIVE PONG CLIENT');
                this._isAlive = true;
            }
        }
    }

    async onData(callback) {
        this.callback = (message) => {
            callback(message.data)
        };
    }

    async sendData(data) {
        try{
            const ws = await this._getWs();
            return ws.send(data);

        } catch(_){ }
    }

    async _prepareWs() {
        const ws = await this.wsBuilder();

        ws.removeEventListener('message', this.callback)

        await waitForWsOpening(ws);

        if  (this.isPingEnabled && ws.ping) {
            ws.removeEventListener('pong', this._onPongHandler)
            clearInterval(this._timerId);
            this._isAlive = true;

            this._timerId = setInterval(() => {
                if (!this._isAlive) {
                    ws.terminate();

                    return clearInterval(this._timerId);
                }

                this._isAlive = false;
                if(ws.readyState === WS_STATES.OPEN) {
                    console.log('SEND PING CLIENT');
                    ws.ping();
                }
            }, this.pingInterval);

            ws.addEventListener('pong', this._onPongHandler);
        }

        console.log({
            on: ws.on,
            addEventListener: ws.addEventListener,
            addListener: ws.addListener
        });

        ws.addEventListener('message', this.callback);

        return ws;
    }

    async _getWs() {
        if (this.ws && this.ws.readyState === WS_STATES.OPEN) {
            return this.ws;
        } else {
            this.ws = await this._prepareWs();
            return this.ws;
        }
    }
}

module.exports = TransportClientWS;
