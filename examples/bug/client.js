const WebSocket = require('ws');
const WSS_PORT = 8000;
async function main() {
    const ws1 = new WebSocket(`ws://localhost:${WSS_PORT}`);
    const ws2 = new WebSocket(`ws://localhost:${WSS_PORT}`);

    ws1.on('message', data => {
        console.log('ws1', data);
        ws1.send('ws1 reply');
    });

    ws2.on('message', data => {
        console.log('ws2', data);
        ws2.send('ws2 reply');
    });
}

main().then(console.log, console.error);
