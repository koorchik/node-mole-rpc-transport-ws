function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, (...args) => {
            resolve(args);
        });

        emitter.on('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = { waitForEvent, sleep };
