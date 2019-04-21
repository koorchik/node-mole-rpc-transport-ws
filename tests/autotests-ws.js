const MoleClient = require('mole-rpc/MoleClient');
const MoleClientProxified = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');
const AutoTester = require('mole-rpc/AutoTester');

const TransportClientWS = require('../TransportClientWS');
const TransportServerWS = require('../TransportServerWS');

const WebSocket = require('ws');
const WSS_PORT = 12345;

async function main() {
    console.log(`RUN ${__filename}`);
    const [server, clients] = await Promise.all([prepareServer(), prepareClients()]);

    const autoTester = new AutoTester({
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer() {
    const server = new MoleServer({
        transports: []
    });

    const wss = new WebSocket.Server({
        port: WSS_PORT
    });

    wss.on('connection', ws => {
        server.registerTransport(
            new TransportServerWS({
                wsBuilder: () => ws
            })
        );
    });

    return server;
}

async function prepareClients() {
    const wsBuilder = () => new WebSocket(`ws://localhost:${WSS_PORT}`);

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({ wsBuilder })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({ wsBuilder })
    });

    return { simpleClient, proxifiedClient };
}

main().then(() => {
    process.exit();
}, console.error);
