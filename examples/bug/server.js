const WebSocket = require('ws');
const WSS_PORT = 8000;
async function main() {
    const wss = new WebSocket.Server({ port: WSS_PORT });

    wss.on('connection', async ws => {
        console.log('client connected');

        ws.on('close', () => {
            console.log('client disconnected');
        });

        ws.on('message', data => {
            console.log('message', data);
        });

        console.log('READY STATE', ws.readyState);

        await ws.send('1');
        await ws.send('2');
    });
}

main().then(console.log, console.error);
