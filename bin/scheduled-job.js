#!/usr/bin/env node
const tasks = require('../tasks');

async function main() {
    console.log('running scheduled job');
    await tasks.validateReportingData.main();
    await tasks.airtableToGoogleSheets.main();
    console.log('finished running scheduled job');
}

main();
