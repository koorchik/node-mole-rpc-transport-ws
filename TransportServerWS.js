const readyState = require('./readyState');
const { sleep, waitForEvent } = require('./utils');

class TransportServerWS {
    constructor({ wsBuilder } = {}) {
        if (!wsBuilder) throw new Error('"wsBuilder" required');
        this.wsBuilder = wsBuilder;
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
            } catch (error) {}
            await sleep(1000);
        }
    }

    async _prepareWs() {
        const ws = this.wsBuilder();

        if (ws.readyState === readyState.CONNECTING) {
            await waitForEvent(ws, 'open');
        }

        ws.addEventListener('message', async message => {
            const reqData = message.data;
            const resData = await this.callback(reqData);

            if (!resData) return;

            ws.send(resData);
        });

        return ws;
    }
}

module.exports = TransportServerWS;
