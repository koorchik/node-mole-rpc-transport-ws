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
    const ws1 = new WebSocket(`ws://localhost:${WSS_PORT}`);
    await waitForEvent(ws1, 'open');

    const ws2 = new WebSocket(`ws://localhost:${WSS_PORT}`);
    await waitForEvent(ws2, 'open');

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            ws: ws1
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            ws: ws2
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
