const utils = require('../../utils-module');

async function airtableToGoogleSheets() {
    var fields = process.env.fields.split(', ');
    var result = await utils.Airtable.getReportingRecords(fields);
    var sails = utils.Common.mapRecords(result.sails, result.idMap, fields);
    await utils.Google.updateGoogleSheets(sails);
}

async function main() {
    try {
        await airtableToGoogleSheets();
    }
    catch (err) {
        var message = 'google sheets update failed: ' + err.stack;
        utils.Slack.post(message);
        throw new Error(message);
    }
}

exports.main = main;