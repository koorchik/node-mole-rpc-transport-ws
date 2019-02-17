function test2() {
    return new Promise((resolve, reject) => {
        throw 20;
    });
}

function test() {
    return new Promise((resolve, reject) => {
        return test2().catch(reject);
    });
}

async function main() {
    const promise = test();
    try {
        await promise;
    } catch (error) {
        console.log('ERROR', error);
    }
}

main();
