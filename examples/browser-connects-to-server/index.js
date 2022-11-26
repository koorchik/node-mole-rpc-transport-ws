//import 'babel-polyfill';

import MoleClient from 'mole-rpc/MoleClientProxified';
import TransportClientWS from '../../TransportClientWS';

import { sleep } from '../../utils';

const WSS_PORT = 12345;

async function main() {
    const client = new MoleClient({
        requestTimeout: 1000,
        transport: prepareTransport()
    });

    while (true) {
        try {
            console.log(await client.sum(2, 3));
            console.log(await client.multiply(2, 3));
        } catch (error) {
            console.log('ERROR', error);
        }
        await sleep(2000);
    }
}

function prepareTransport() {
    return new TransportClientWS({
        wsBuilder: () => new WebSocket(`ws://localhost:${WSS_PORT}`)
    });
}

main().then(console.log, console.error);
