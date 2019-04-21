const readyState = require('./readyState');
const utils = require('./utils');

class TransportClientWS {
    constructor({ wsBuilder } = {}) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');
        this.wsBuilder = wsBuilder;
        this.ws = null;
    }

    async onData(callback) {
        this.callback = callback;
    }

    async sendData(data) {
        const ws = await this._getWs();
        return ws.send(data);
    }

    async _prepareWs() {
        const ws = this.wsBuilder();

        if (ws.readyState === readyState.CONNECTING) {
            await utils.waitForEvent(ws, 'open');
        }

        ws.addEventListener('message', message => {
            this.callback(message.data);
        });

        return ws;
    }

    async _getWs() {
        if (this.ws && this.ws.readyState === readyState.OPEN) {
            return this.ws;
        } else {
            this.ws = await this._prepareWs();
            return this.ws;
        }
    }
}

module.exports = TransportClientWS;
