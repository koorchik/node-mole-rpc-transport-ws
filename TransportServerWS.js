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
        console.log('prepreaws');
        const ws = this.wsBuilder();

        if (ws.readyState === readyState.CONNECTING) {
            await waitForEvent(ws, 'open');
        }

        ws.on('message', async reqData => {
            const resData = await this.callback(reqData);
            console.log('reqData', reqData);
            console.log('resData', resData);
            if (!resData) return;

            ws.send(resData);
        });

        return ws;
    }
}

module.exports = TransportServerWS;
