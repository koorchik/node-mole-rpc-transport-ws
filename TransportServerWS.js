class TransportServerWS {
    constructor({ ws } = {}) {
        if (!ws) throw new Error('"ws" required');
        this.ws = ws;
    }

    async onData(callback) {
        this.ws.on('message', async reqData => {
            const resData = await callback(reqData);
            if (!resData) return;

            this.ws.send(resData);
        });
    }
}

module.exports = TransportServerWS;
