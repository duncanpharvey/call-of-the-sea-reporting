const utils = require('../../utils-module');

async function airtableToGoogleSheets() {
    console.log('starting to update google sheets');

    var fields = process.env.fields.split(', ');

    console.log('getting records from airtable');
    var result = await utils.Airtable.getReportingRecords(fields);

    console.log('mapping records to add to google sheets');
    var sails = utils.Common.mapRecords(result.sails, result.idMap, fields);

    console.log('adding records to google sheets');
    await utils.Google.updateGoogleSheets(sails);
    console.log('finished updating google sheets');
}

async function main() {
    try {
        await airtableToGoogleSheets();
    }
    catch (err) {
        utils.Slack.post('google sheets update failed: ' + err);
    }
}

exports.main = main;