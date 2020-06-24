const tasks = require('./tasks');

async function main() {
    global.date_format = 'YYYY-MM-DDThh:mm:ss';
    process.removeAllListeners('warning');
    await tasks.SyncDatabase.main();
}

main();

module.exports = {
    main: main
};