const MoleClient = require('mole-rpc/MoleClient');
const MoleClientProxified = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');
const X = require('mole-rpc/X');
const AutoTester = require('mole-rpc-autotester');
const { getTestWsConfig } = require('./utils');

const TransportClientWS = require('../TransportClientWS');
const TransportServerWSS = require('../TransportServerWSS');

const WebSocket = require('ws');

const { wsPort, wsUrl } = getTestWsConfig();

async function main() {
    console.log(`RUN TESTS FROM FILE ${__filename}`);
    const [server, clients] = await Promise.all([prepareServer(), prepareClients()]);

    const autoTester = new AutoTester({
        X,
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer() {
    const server = new MoleServer({
        transports: [
            new TransportServerWSS({
                wss: new WebSocket.Server({
                    port: wsPort
                })
            })
        ]
    });

    await server.run();
    return server;
}

async function prepareClients() {
    const wsBuilder = () => new WebSocket(wsUrl);

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder,
            ping: true
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder,
            ping: true
        })
    });

    return { simpleClient, proxifiedClient };
}

main().then(() => {
    process.exit();
}, console.error);
