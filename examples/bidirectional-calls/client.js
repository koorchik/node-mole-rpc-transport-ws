const MoleClient = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');

const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const TransportServerWS = require('../../TransportServerWS');

const { waitForEvent, sleep, substract, divide } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const ws = await prepareWSConnection();

    // Client
    const client = new MoleClient({
        requestTimeout: 1000,
        transport: new TransportClientWS({ ws })
    });

    // Server
    const server = new MoleServer({ transports: [new TransportServerWS({ ws })] });
    server.expose({ substract, divide });
    await server.run();

    console.log(await client.sum(2, 3));
    console.log(await client.multiply(2, 3));
}

async function prepareWSConnection() {
    while (true) {
        try {
            const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);
            await waitForEvent(ws, 'open');

            return ws;
        } catch (error) {
            await sleep(100);
        }
    }
}

main().then(console.log, console.error);
