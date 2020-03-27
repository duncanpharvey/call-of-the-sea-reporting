#!/usr/bin/env node
const tasks = require('../tasks');
const slack = require('../utils-module/lib/slack');

async function main() {
    console.log('running scheduled job');

    try {
        await tasks.validateReportingData.main();
    }
    catch(err) {
        slack.post('data validation failed: ' + err);
    }

    try {
        await tasks.airtableToGoogleSheets.main();
    }
    catch(err) {
        slack.post('google sheets update failed: ' + err)
    }

    console.log('finished running scheduled job');
}

main();
