const MoleServer = require('mole-rpc/MoleServer');
const WebSocket = require('ws');

const TransportServerWS = require('../../TransportServerWS');
const { waitForEvent, sleep, sum, multiply } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const server = new MoleServer({ transports: [await prepareTransport()] });

    server.expose({ sum, multiply });
    await server.run();

    // you can connect to other client with the same server
    server.registerTransport(await prepareTransport());
}

async function prepareTransport() {
    while (true) {
        try {
            const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);
            await waitForEvent(ws, 'open');

            return new TransportServerWS({ ws });
        } catch (error) {
            await sleep(100);
        }
    }
}

main().catch(console.error);
