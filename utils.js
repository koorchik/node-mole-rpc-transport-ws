function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.addEventListener(eventName, (...args) => {
            resolve(args);
        });

        emitter.addEventListener('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

module.exports = { waitForEvent, sleep };
