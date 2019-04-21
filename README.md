## WebSocket Transport for Mole RPC (JSON RPC Library)

WebSocket transport for Mole-RPC (JSON RPC library)

Works both in browser and on server

Moreover, it can work in different modes:

### Connect from browser to server.

It is the most simple scenario.

See [examples/browser-connects-to-server](./examples/browser-connects-to-server/)

### Connect from client to server.

It is the most simple scenario. You use ws connection to send messages.

See [examples/client-connects-to-server](./examples/client-connects-to-server/)

### Connect from server to client.

For example, you want to send RPC calls from external network to internal but server is behind NAT. So, your server (in internal network) can connect to your client (in Internet) and after that client will send RPC request to connected server.

See [examples/server-connects-to-client](./examples/server-connects-to-client/)

### Bidirectional connection

Each side works as client and server the same time.

See [examples/bidirectional-calls](./examples/bidirectional-calls/)
