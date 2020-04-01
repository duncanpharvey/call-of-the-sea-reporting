const utils = require('../../utils-module');

async function logUnlinkedReportingRecords() {
    var result = await utils.Airtable.getUnlinkedReportingRecords();
    if (result.length > 0) {
        utils.Slack.post('unlinked reporting records: ' + result.join(', '));
    }
}

async function logBoatLinkErrors() {
    var result = await utils.Airtable.getBoatLinkErrors();

    if (result.multiple.length > 0) {
        utils.Slack.post('multiple by boat records linked to one reporting record: ' + result.multiple.join(', '));
    }

    if (result.duplicate.length > 0) {
        utils.Slack.post('duplicate by boat sails in reporting table: ' + result.duplicate.join(', '));
    }
}

async function logIndividualLinkErrors() {
    var result = await utils.Airtable.getIndividualLinkErrors();

    if (result.duplicate.length > 0) {
        utils.Slack.post('duplicate by individual sails in reporting table: ' + result.duplicate.join(', '));
    }
}

async function logEventIdLinkErrors() {
    var result = await utils.Airtable.getEventIdLinkErrors();

    if (result.missing.length > 0) {
        utils.Slack.post('missing records in reporting table: ' + result.missing.join(', '));
    }

    if (result.badLink.length > 0) {
        utils.Slack.post('eventIds not linked properly for records: ' + result.badLink.join(', '));
    }
}

async function validateData() {
    console.log('starting to validate data');

    console.log('checking unlinked reporting records');
    await logUnlinkedReportingRecords();

    console.log('checking if by boat sails are linked properly');
    await logBoatLinkErrors();

    console.log('checking if by individual sails are linked properly');
    await logIndividualLinkErrors();

    console.log('checking if eventIds are linked properly')
    await logEventIdLinkErrors();

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
exports.logBoatLinkErrors = logBoatLinkErrors;
exports.logIndividualLinkErrors = logIndividualLinkErrors;
exports.logEventIdLinkErrors = logEventIdLinkErrors;