const MoleClient = require('mole-rpc/MoleClientProxified');
const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const { waitForEvent, sleep } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const client = new MoleClient({
        requestTimeout: 1000,
        transport: await prepareTransport()
    });

    console.log(await client.sum(2, 3));
    console.log(await client.multiply(2, 3));
}

async function prepareTransport() {
    while (true) {
        try {
            const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);
            await waitForEvent(ws, 'open');

            return new TransportClientWS({ ws });
        } catch (error) {
            await sleep(100);
        }
    }
}

main().then(console.log, console.error);
