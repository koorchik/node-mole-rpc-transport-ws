function sum(a, b) {
    console.log('called sum');
    return a + b;
}

function multiply(a, b) {
    console.log('called multiply');
    return a * b;
}

function substract(a, b) {
    console.log('called substract');
    return a - b;
}

function divide(a, b) {
    console.log('called divide');
    return a / b;
}

module.exports = { substract, divide, sum, multiply };
