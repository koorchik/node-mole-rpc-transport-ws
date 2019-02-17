class TransportServerWS {
    constructor({ wss } = {}) {
        if (!wss) throw new Error('"wss" required');
        this.wss = wss;
    }

    async onData(callback) {
        this.wss.on('connection', ws => {
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

module.exports = TransportServerWS;
