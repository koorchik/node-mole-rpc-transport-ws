const MoleClient = require('mole-rpc/MoleClient');
const MoleClientProxified = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');
const AutoTester = require('mole-rpc/AutoTester');

const TransportClientWS = require('../TransportClientWS');
const TransportServerWSS = require('../TransportServerWSS');

const WebSocket = require('ws');
const WSS_PORT = 12345;

async function main() {
    console.log(`RUN TESTS FROM FILE ${__filename}`);
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
        transports: [
            new TransportServerWSS({
                wss: new WebSocket.Server({
                    port: WSS_PORT
                })
            })
        ]
    });

    await server.run();
    return server;
}

async function prepareClients() {
    const wsBuilder = () => new WebSocket(`ws://localhost:${WSS_PORT}`);

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder
        })
    });

    return { simpleClient, proxifiedClient };
}

function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, (...args) => {
            resolve(args);
        });
    });
}

main().then(() => {
    process.exit();
}, console.error);
