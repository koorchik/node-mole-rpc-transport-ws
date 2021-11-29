class BaseError extends Error {
    constructor(code, payload) {
        super(code);

        this.code = code;

        const errorCodes = this.constructor.codes;

        if (errorCodes && errorCodes[code]) {
            this.message = errorCodes[code](payload);
        }
    }
}

class WsFactoryError extends BaseError {
    static get codes() {
        return {
            WS_BUILDER_INVALID_OBJECT: () => 'Ws building error: builder returned invalid object',
            WS_BUILDER_SAME_OBJECT: () => 'Ws building error: builder returned same object',
            WS_OPENING_ERROR: ({ reason }) => `Ws opening error: ${reason}`
        };
    }
}

module.exports = {
    WsFactoryError
};
