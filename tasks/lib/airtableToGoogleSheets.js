const utils = require('../../utils-module');

async function main() {
    console.log('starting to update google sheets');

    var fields = process.env.fields.split(', ');

    console.log('getting records from airtable');
    result = await utils.Airtable.getReportingRecords(fields);

    console.log('mapping records to add to google sheets');
    sails = utils.Common.mapRecords(result.sails, result.idMap, fields);

    console.log('adding records to google sheets');
    await utils.Google.updateGoogleSheets(sails);
    console.log('finished updating google sheets');
}

exports.main = main;