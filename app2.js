const tasks = require('./tasks');

async function main() {
    global.dateFormat = 'YYYY-MM-DDThh:mm:ss';
    process.removeAllListeners('warning');
    await tasks.SyncDatabase.main();
}

main();

module.exports = {
    main: main
};