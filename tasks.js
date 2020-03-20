const utils = require('./utils-module');

async function airtableToGoogleSheets() {
    console.log('start', Date(Date.now()).toString());

    var fields = process.env.fields.split(', ');

    result = await utils.Airtable.getAirtableRecords(fields);

    sails = utils.Common.mapRecords(result.sails, result.idMap, fields);

    await utils.Google.updateGoogleSheets(sails);
    console.log('finish', Date(Date.now()).toString());
}

exports.airtableToGoogleSheets = airtableToGoogleSheets;