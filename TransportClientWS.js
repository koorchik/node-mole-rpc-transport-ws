class TransportClientWS {
    constructor({ ws } = {}) {
        if (!ws) throw new Error('"ws" required');
        this.ws = ws;
    }

    async onData(callback) {
        this.ws.on('message', callback);
    }

    async sendData(data) {
        await this.ws.send(data);
    }
}

module.exports = TransportClientWS;
