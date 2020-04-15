const utils = require('../../utils-module');

async function airtableToGoogleSheets() {
    var fields = process.env.fields.split(', ');
    var airtableRecords = await utils.Airtable.getReportingRecords(fields);
    var googleRecords = utils.Common.mapFromAirtableToGoogle(airtableRecords, fields);
    await utils.Google.updateGoogleSheets(googleRecords);
}

async function run() {
    try {
        await airtableToGoogleSheets();
    }
    catch (err) {
        var message = `google sheets update failed: ${err.stack}`;
        utils.Slack.post(message);
        throw new Error(message);
    }
}

exports.run = run;