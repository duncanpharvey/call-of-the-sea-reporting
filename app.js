const tasks = require('./tasks');

async function main() {
    console.log('running job');

    await tasks.validateData.main();
    await tasks.airtableToGoogleSheets.main();

    console.log('finished running job');
}

main();