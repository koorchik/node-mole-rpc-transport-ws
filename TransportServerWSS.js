class TransportServerWSS {
    constructor({ wss } = {}) {
        if (!wss) throw new Error('"wss" required');

        this.wss = wss;
    }

    async onData(callback) {
        this.wss.on('connection', ws => {
            const messageHandler = async (data) => {
                const response = await callback(data);

                if (response) {
                    ws.send(response);
                }
            };

            ws.on('message', messageHandler);

            ws.on('close', () => {
                ws.terminate();
            });
        });
    }
}

module.exports = TransportServerWSS;
