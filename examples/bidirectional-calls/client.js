const MoleClient = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');

const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const TransportServerWS = require('../../TransportServerWS');

const { substract, divide } = require('../mathFunctions');

const WSS_PORT = 12345;

async function main() {
    const ws = new WebSocket(`ws://localhost:${WSS_PORT}`);

    // Client
    const client = new MoleClient({
        requestTimeout: 1000,
        transport: new TransportClientWS({ wsBuilder: () => ws })
    });

    // Server
    const server = new MoleServer({ transports: [ new TransportServerWS({ wsBuilder: () => ws }) ] });
    server.expose({ substract, divide });
    await server.run();

    console.log(await client.sum(2, 3));
    console.log(await client.multiply(2, 3));
}

main().then(console.log, console.error);
