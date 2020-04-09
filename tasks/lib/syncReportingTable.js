const utils = require('../../utils-module');

async function syncReportingTable() {
    var results = await utils.Airtable.getReportingDifference();
    if (results.remove.length > 0) utils.Slack.post('removing reporting records: ' + JSON.stringify(results.remove));
    if (results.add.length > 0) utils.Slack.post('adding reporting records: ' + JSON.stringify(results.add));
    await utils.Airtable.deleteReportingRecords(results.remove);
    await utils.Airtable.addReportingRecords(results.add);
}

async function main() {
    try {
        await syncReportingTable();
    }
    catch (err) {
        var message = 'sync reporting table failed: ' + err.stack;
        utils.Slack.post(message);
        throw new Error(message);
    }
}

exports.main = main;