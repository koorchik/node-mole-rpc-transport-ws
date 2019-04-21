const MoleClient = require('mole-rpc/MoleClientProxified');
const WebSocket = require('ws');
const TransportClientWS = require('../../TransportClientWS');
const { sleep } = require('../../utils');

const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });
    let clients = [];

    wss.on('connection', async ws => {
        console.log('server connected');

        const newClient = new MoleClient({
            requestTimeout: 1000,
            transport: new TransportClientWS({
                wsBuilder: () => ws
            })
        });

        // You can add your clients to own pool
        // You will need it if there will be several
        // servers that will connect
        clients.push(newClient);

        ws.on('close', () => {
            console.log('server disconnected');

            // connection closed. You can remove your client from pool
            clients = clients.filter(c => c !== newClient);
        });

        try {
            await sleep(100);
            console.log(`Clients in pool: ${clients.length}`);
            for (const client of clients) {
                console.log(await client.sum(2, 3));
                console.log(await client.multiply(2, 3));
            }
        } catch (error) {
            console.log('request error', error);
        }
    });
}

main().then(console.log, console.error);
