const utils = require('../../utils-module');

async function main () {
    console.log('starting to validate data');

    console.log('checking if all by boat sails are linked properly');
    await utils.Airtable.boatSailsLinked();

    console.log('checking if by individual sails are linked propertly');
    await utils.Airtable.individualSailsLinked();

    // by individual sails linked correctly (eventId matches between linked records)
    // remove reporting records with no by boat sails or by individual sails
    console.log('finished validating data');
}

exports.main = main;