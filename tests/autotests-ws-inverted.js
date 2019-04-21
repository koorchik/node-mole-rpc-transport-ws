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
    const wsBuilder = new WebSocket(`ws://localhost:${WSS_PORT}`);

    return new MoleServer({
        transports: [new TransportServerWS({ wsBuilder }), new TransportServerWS({ wsBuilder })]
    });
}

async function prepareClients() {
    const wss = new WebSocket.Server({
        port: WSS_PORT
    });

    const [ws1] = await waitForEvent(wss, 'connection');
    const [ws2] = await waitForEvent(wss, 'connection');

    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder: () => ws1
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClientWS({
            wsBuilder: () => ws2
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
