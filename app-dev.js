const tasks = require('./tasks');

async function main() {
    global.dateFormat = 'YYYY-MM-DD HH:mm:ss';
    await tasks.SyncAirtable.main();
    await tasks.SyncDatabase.main();
}

main();