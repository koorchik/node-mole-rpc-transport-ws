const WsAdapter = require('./WsAdapter');

class TransportServerWSS {
    constructor({ wss } = {}) {
        if (!wss) throw new Error('"wss" required');
        this.wss = wss;
    }

    async onData(callback) {
        this.wss.on('connection', _ws => {
            const ws = WsAdapter.wrapIfRequired(_ws);

            ws.on('message', async reqData => {
                const resData = await callback(reqData);

                if (!resData) return;

                ws.send(resData);
            });

            ws.on('close', () => {
                ws.terminate();
            });
        });
    }
}

module.exports = TransportServerWSS;
