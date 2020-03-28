const utils = require('../../utils-module');

async function main() {
    console.log('starting to validate data');

    console.log('deleting unlinked reporting records');
    await utils.Airtable.deleteUnlinkedReportingRecords();

    console.log('checking if all by boat sails are linked properly');
    await utils.Airtable.boatSailsLinked();

    console.log('checking if by individual sails are linked propertly');
    await utils.Airtable.individualSailsLinked();

    console.log('finished validating data');
}

exports.main = main;