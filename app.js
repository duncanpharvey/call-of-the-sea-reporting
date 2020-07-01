const tasks = require('./tasks');

async function main() {
    global.dateFormat = 'YYYY-MM-DD HH:mm:ss';
    await tasks.SyncDatabase.main();
}

module.exports = {
    main: main
};