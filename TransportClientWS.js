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
        console.log('sendData', ws.readyState, data);

        return ws.send(data);
    }

    async _prepareWs() {
        const ws = this.wsBuilder();
        console.log('_prepareWs', ws.readyState);
        if (ws.readyState === readyState.CONNECTING) {
            await utils.waitForEvent(ws, 'open');
        }

        ws.on('message', data => {
            console.log('Get data', data);
            this.callback(data);
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
