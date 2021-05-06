const MoleClient = require('mole-rpc/MoleClientProxified');
const MoleServer = require('mole-rpc/MoleServer');

const WebSocket = require('ws');

const TransportClientWS = require('../../TransportClientWS');
const TransportServerWS = require('../../TransportServerWS');
const { sum, multiply } = require('../mathFunctions');

const WSS_PORT = 12345;

async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    const server = new MoleServer({ transports: [] });
    server.expose({ sum, multiply });
    await server.run();

    wss.on('connection', async ws => {
        try {
            let transport = new TransportServerWS({ wsBuilder: () => ws });

            // terminate the transport on connection close
            // if not, server-side wsBuilder(s) get called
            // periodically after connection is closed
            ws.on("close", () => transport.terminate());

            server.registerTransport(transport);

            const client = new MoleClient({
                requestTimeout: 1000,
                transport: new TransportClientWS({ wsBuilder: () => ws })
            });

            console.log(await client.divide(2, 3));
            console.log(await client.substract(2, 3));
        } catch (error) {
            console.error(error);
        }
    });
}

main().then(console.log, console.error);
