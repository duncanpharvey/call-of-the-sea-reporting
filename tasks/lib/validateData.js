const utils = require('../../utils-module');

async function validateData() {
    var results = await utils.Airtable.getDuplicateEventIds();
    if (results.length > 0) utils.Slack.post('duplicate eventIds: ' + JSON.stringify(results));
}

async function run() {
    try {
        await validateData();
    }
    catch (err) {
        var message = 'data validation failed: ' + err.stack;
        utils.Slack.post(message);
        throw new Error(message);
    }
}

exports.run = run;