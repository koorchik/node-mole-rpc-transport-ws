const MoleClient = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');

const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const TransportServerWS = require('../../TransportServerWS');
const { sum, multiply } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    const server = new MoleServer({ transports: [] });
    server.expose({ sum, multiply });
    await server.run();

    wss.on('connection', async ws => {
        server.registerTransport(new TransportServerWS({ ws }));

        const client = new MoleClient({
            requestTimeout: 1000,
            transport: new TransportClientWS({ ws })
        });

        console.log(await client.divide(2, 3));
        console.log(await client.substract(2, 3));
    });
}

main().then(console.log, console.error);
