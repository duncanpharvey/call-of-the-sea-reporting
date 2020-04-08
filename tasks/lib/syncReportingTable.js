const utils = require('../../utils-module');

async function syncReportingTable() {
    var results = await utils.Airtable.getReportingDifference();
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