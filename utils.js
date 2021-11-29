function sleep(delayMs) {
    return new Promise(resolve => {
        setTimeout(resolve, delayMs);
    });
}

module.exports = {
    sleep
};
