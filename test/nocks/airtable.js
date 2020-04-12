const nock = require('nock');

function get() {
    nock('https://api.airtable.com:443')
        .persist()
        .get(/.*/)
        .query(true)
        .reply(200, { "records": [] });
}

function linkedReportingRecordsAllFields(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/Reporting')
        .query({ "fields%5B%5D": process.env.fields.split(', '), "filterByFormula": "XOR%28NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29%2C%20NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29%29", "sort%5B0%5D%5Bfield%5D": "ID", "sort%5B0%5D%5Bdirection%5D": "asc" })
        .reply(200, response);
}

function byBoatSailIds(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
        .query({ "fields%5B%5D": "Sail_Id" })
        .reply(200, response);
}

function byIndividualSailIds(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
        .query({ "fields%5B%5D": "Participant_Id" })
        .reply(200, response);
}

function unlinkedReportingRecords(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/Reporting')
        .query({ "fields%5B%5D": "ID", "filterByFormula": "NOT%28XOR%28NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29%2C%20NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29%29%29" })
        .reply(200, response);
}

function linkedReportingRecords(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/Reporting')
        .query({ "fields%5B%5D": ["EventId", "ByBoatSails", "ByIndividualSails"], "filterByFormula": "XOR%28NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29%2C%20NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29%29" })
        .reply(200, response);
}

function byBoatSails(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
        .query({ "fields%5B%5D": "EventId", "filterByFormula": "AND%28NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29%2C%20NOT%28%7BEventId%7D%20%3D%20%27%27%29%29" })
        .reply(200, response);
}

function byIndividualSails(response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
        .query({ "fields%5B%5D": "EventId", "filterByFormula": "AND%28NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29%2C%20NOT%28%7BEventId%7D%20%3D%20%27%27%29%29" })
        .reply(200, response);
}

function addReportingRecords(request, response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .post('/v0/' + process.env.airtable_base_id + '/Reporting/', request)
        .query({})
        .reply(200, response);
}

function deleteReportingRecords(request, response) {
    nock('https://api.airtable.com:443', { "encodedQueryParams": true })
        .delete('/v0/' + process.env.airtable_base_id + '/Reporting' + request)
        .reply(200, response);
}

module.exports = {
    get: get,
    linkedReportingRecordsAllFields: linkedReportingRecordsAllFields,
    byBoatSailIds: byBoatSailIds,
    byIndividualSailIds: byIndividualSailIds,
    unlinkedReportingRecords: unlinkedReportingRecords,
    linkedReportingRecords: linkedReportingRecords,
    byBoatSails: byBoatSails,
    byIndividualSails: byIndividualSails,
    addReportingRecords: addReportingRecords,
    deleteReportingRecords: deleteReportingRecords
};