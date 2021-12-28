const SUPPORTED_EVENTS = {
    MESSAGE : 'message',
    ERROR   : 'error',
    OPEN    : 'open',
    CLOSE   : 'close'
};

/* Adapter for W3C WebSocket interface
** https://html.spec.whatwg.org/multipage/web-sockets.html#the-websocket-interface
*/
class WsAdapter {
    constructor(ws) {
        this._ws = ws;

        // Map is used to be able remove listeners correctly
        this._wrappedListenersMaps = {};

        Object.values(SUPPORTED_EVENTS).forEach(eventName => {
            this._wrappedListenersMaps[eventName] = new Map();
        });
    }

    static wrapIfRequired(ws) {
        if (ws.on && ws.off) {
            return ws;
        }

        return new WsAdapter(ws);
    }

    get readyState() {
        return this._ws.readyState;
    }

    send(...args) {
        return this._ws.send(...args);
    }

    addEventListener(...args) {
        return this._ws.addEventListener(...args);
    }

    removeEventListener(...args) {
        return this._ws.removeEventListener(...args);
    }

    terminate() {
        this._ws.close();
    }

    on(eventName, listener) {
        let wrappedListener = null;

        switch (eventName) {
            case SUPPORTED_EVENTS.MESSAGE:
                wrappedListener = (messageEvent) => listener(messageEvent.data);
                break;
            case SUPPORTED_EVENTS.ERROR:
                wrappedListener = (errorEvent) => listener(errorEvent.error);
                break;
            case SUPPORTED_EVENTS.OPEN:
            case SUPPORTED_EVENTS.CLOSE:
                wrappedListener = (event) => listener();
                break;
            default:
                throw new Error(`Event [${eventName}] is not supported`);
        }

        const wrappedListenersMap = this._wrappedListenersMaps[eventName];

        // In case of applying same listener to the same event twice
        if (wrappedListenersMap.has(listener)) {
            return;
        }

        wrappedListenersMap.set(listener, wrappedListener);

        this._ws.addEventListener(eventName, wrappedListener);
    }

    off(eventName, listener) {
        if (!Object.values(SUPPORTED_EVENTS).includes(eventName)) {
            throw new Error(`Event [${eventName}] is not supported`);
        }

        const wrappedListenersMap = this._wrappedListenersMaps[eventName];
        const wrappedListener = wrappedListenersMap.get(listener);

        if (!wrappedListener) {
            return;
        }

        wrappedListenersMap.delete(listener);

        this._ws.removeEventListener(eventName, wrappedListener);
    }
}

module.exports = WsAdapter;
