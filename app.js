const tasks = require('./tasks');

async function main() {
    await tasks.validateData.main();
    await tasks.airtableToGoogleSheets.main();
}

main();