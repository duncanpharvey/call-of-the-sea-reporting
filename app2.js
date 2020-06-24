const tasks = require('./tasks');

async function main() {
    global.dateFormat = 'YYYY-MM-DDThh:mm:ss';
    await tasks.SyncDatabase.main();
}

module.exports = {
    main: main
};