const MoleClient = require('mole-rpc/MoleClient');
const WebSocket = require('ws');
const TransportClientWS = require('../../TransportClientWS');
const { sleep } = require('../utils');

const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    wss.on('connection', async ws => {
        // you can add your clients to own pool
        // You will need it if there will be several servers that will connect
        console.log('server connected');
        ws.send('{"a": 1}');
        const client = new MoleClient({
            requestTimeout: 1000,
            transport: new TransportClientWS({
                wsBuilder: () => ws
            })
        });

        ws.on('close', () => {
            // connection closed. You can remove your client from pool
            console.log('server disconnected');
        });

        try {
            await sleep(100);
            console.log(await client.callMethod('sum', [2, 3]));
            console.log(await client.callMethod('multiply', [2, 3]));
        } catch (error) {
            console.log('request error', error);
        }
    });
}

main().then(console.log, console.error);
