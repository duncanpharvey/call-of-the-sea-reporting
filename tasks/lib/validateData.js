const utils = require('../../utils-module');

async function logUnlinkedReportingRecords() {
    var result = await utils.Airtable.getUnlinkedReportingRecords();
    if (result.length > 0) {
        utils.Slack.post('unlinked reporting records: ' + result.join(', '));
    }
}

async function validateData() {
    console.log('starting to validate data');

    console.log('checking unlinked reporting records');
    await logUnlinkedReportingRecords();

    console.log('checking if all by boat sails are linked properly');
    await utils.Airtable.boatSailsLinked();

    console.log('checking if by individual sails are linked propertly');
    await utils.Airtable.individualSailsLinked();

    console.log('finished validating data');
}

async function main() {
    try {
        await validateData();
    }
    catch (err) {
        utils.Slack.post('data validation failed: ' + err);
    }
}

exports.main = main;
exports.logUnlinkedReportingRecords = logUnlinkedReportingRecords;