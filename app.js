const tasks = require('./tasks');

async function main() {
    await tasks.syncReportingTable.main();
    await tasks.airtableToGoogleSheets.main();
}

main();