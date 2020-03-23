## WebSocket Transport for Mole RPC (JSON RPC Library)

[![npm version](https://badge.fury.io/js/mole-rpc-transport-ws.svg)](https://badge.fury.io/js/mole-rpc-transport-ws)
[![Build Status](https://travis-ci.org/koorchik/node-mole-rpc-transport-ws.svg?branch=master)](https://travis-ci.org/koorchik/node-mole-rpc-transport-ws)
[![Known Vulnerabilities](https://snyk.io/test/github/koorchik/node-mole-rpc-transport-ws/badge.svg?targetFile=package.json)](https://snyk.io/test/github/koorchik/node-mole-rpc-transport-ws?targetFile=package.json)


Mole-RPC is a tiny transport agnostic JSON-RPC 2.0 client and server which can work both in NodeJs, Browser, Electron etc.

This is WebSocket based tranport but there are [many more transports](https://www.npmjs.com/search?q=keywords:mole-transport). 

**This transport Works both in browser and on server**

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
