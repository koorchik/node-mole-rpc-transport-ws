const MoleClient = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');

const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const TransportServerWS = require('../../TransportServerWS');
const { sum, multiply } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    wss.on('connection', async ws => {
        const server = new MoleServer({
            requestTimeout: 1000,
            transports: [new TransportServerWS({ ws })]
        });

        server.expose({ sum, multiply });
        await server.run();

        const client = new MoleClient({
            requestTimeout: 1000,
            transport: new TransportClientWS({ ws })
        });

        console.log(await client.divide(2, 3));
        console.log(await client.substract(2, 3));
    });

    function prepareTransports() {
        return [
            new TransportServerWSS({
                wss: new WebSocket.Server({
                    port: WSS_PORT
                })
            })
        ];
    }
}

async function prepareTransport(ws) {
    return new TransportClientWS({ ws });
}

main().then(console.log, console.error);
