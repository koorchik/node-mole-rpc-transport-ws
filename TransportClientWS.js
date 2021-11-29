const WsFactory = require('./WsFactory');
const { WS_STATES } = require('./constants');

class TransportClientWS {
    constructor({ wsBuilder, ping, pingInterval } = {}) {
        this._wsFactory = new WsFactory({ wsBuilder, ping, pingInterval });

        // Property left public to provide ws object access via [moleClient.transport.ws]
        this.ws = null;
    }

    async onData(callback) {
        const messageHandler = async (data) => {
            callback(data);
        };

        this._wsFactory.setMessageHandler(messageHandler);
    }

    async sendData(data) {
        try {
            const isWsClosed = !this.ws || this.ws.readyState !== WS_STATES.OPEN;

            if (isWsClosed) {
                this.ws = await this._wsFactory.buildWsInstance();
            }

            return this.ws.send(data);
        } catch (error) {
            // Ignore unexpected building errors
        }
    }
}

module.exports = TransportClientWS;
