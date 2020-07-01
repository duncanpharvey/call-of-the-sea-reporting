module.exports = {
    SyncDatabase: require('./lib/sync-database.js'),
    SyncAirtable: require('./lib/sync-airtable.js'),
    airtableToGoogleSheets: require('./lib/airtableToGoogleSheets.js'),
    syncReportingTable: require('./lib/syncReportingTable.js'),
    validateData: require('./lib/validateData.js')
};