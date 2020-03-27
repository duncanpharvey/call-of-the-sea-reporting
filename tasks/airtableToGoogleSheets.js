const utils = require('../utils-module');

async function main() {
    console.log('start', Date(Date.now()).toString());

    var fields = process.env.fields.split(', ');

    console.log('getting records from Airtable');
    result = await utils.Airtable.getReportingRecords(fields);

    console.log('mapping records to add to google sheets');
    sails = utils.Common.mapRecords(result.sails, result.idMap, fields);

    console.log('adding records to google sheets');
    await utils.Google.updateGoogleSheets(sails);
    console.log('finish', Date(Date.now()).toString());
}

exports.main = main;