const nock = require('nock');

function get() {
    nock('https://api.airtable.com:443')
        .persist()
        .get(/.*/)
        .query(true)
        .reply(200, { "records": [] });
}

function linkedReportingRecordsAllFields(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/Reporting`)
        .query({
            "fields[]": process.env.fields.split(', '),
            "filterByFormula": "XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))",
            "sort": [{ "field": "ID", "direction": "asc" }]
        })
        .reply(200, { "records": response });
}

function byBoatSailIds(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/By%20Boat%20Sails`)
        .query({ "fields[]": "Sail_Id" })
        .reply(200, { "records": response });
}

function byIndividualSailIds(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/By%20Individual%20Sails`)
        .query({ "fields[]": "Participant_Id" })
        .reply(200, { "records": response });
}

function unlinkedReportingRecords(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/Reporting`)
        .query({
            "fields[]": "ID",
            "filterByFormula": "NOT(XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = '')))"
        })
        .reply(200, { "records": response });
}

function linkedReportingRecords(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/Reporting`)
        .query({
            "fields[]": ["EventId", "ByBoatSails", "ByIndividualSails"],
            "filterByFormula": "XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))"
        })
        .reply(200, { "records": response });
}

function byBoatSails(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/By%20Boat%20Sails`)
        .query({
            "fields[]": "EventId",
            "filterByFormula": "NOT({EventId} = '')"
        })
        .reply(200, { "records": response });
}

function byIndividualSails(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/By%20Individual%20Sails`)
        .query({
            "fields[]": "EventId",
            "filterByFormula": "NOT({EventId} = '')"
        })
        .reply(200, { "records": response });
}

function addReportingRecords(request, response) {
    nock('https://api.airtable.com:443')
        .post(`/v0/${process.env.airtable_base_id}/Reporting/`, { "records": request })
        .query({})
        .reply(200, { "records": response });
}

function deleteReportingRecords(request, response) {
    nock('https://api.airtable.com:443')
        .delete(`/v0/${process.env.airtable_base_id}/Reporting${request}`)
        .reply(200, { "records": response });
}

function eventbriteRecords(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/By%20Individual%20Sails`)
        .query({
            "fields[]": ["EventbriteEventId", "EventbriteAttendeeId"],
            "filterByFormula": "AND(AND(NOT({EventbriteAttendeeId} = ''), NOT({EventbriteEventId} = ''), NOT({Status} = 'Cancelled')), OR(IS_SAME({DisembarkingDate}, TODAY(), 'day'), IS_AFTER({DisembarkingDate}, TODAY())))"
        })
        .reply(200, { "records": response });
}

function updateByIndividualSails(request, response) {
    nock('https://api.airtable.com:443')
        .patch(`/v0/${process.env.airtable_base_id}/By%20Individual%20Sails/`, { "records": request })
        .query({})
        .reply(200, { "records": response });
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
    deleteReportingRecords: deleteReportingRecords,
    eventbriteRecords: eventbriteRecords,
    updateByIndividualSails: updateByIndividualSails
};