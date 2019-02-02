const MoleClient = require('mole-rpc/MoleClientProxified');
const TransportClientWS = require('../../TransportClientWS');
const WebSocket = require('ws');
const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    wss.on('connection', async ws => {
        const client = new MoleClient({
            requestTimeout: 1000,
            transport: await prepareTransport(ws)
        });
        console.log(await client.sum(2, 3));
        console.log(await client.multiply(2, 3));
    });
}

async function prepareTransport(ws) {
    return new TransportClientWS({ ws });
}

main().then(console.log, console.error);
