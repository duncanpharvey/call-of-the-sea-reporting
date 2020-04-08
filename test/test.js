const nock = require('nock');
const tasks = require('../tasks');

// nock.disableNetConnect()

// should fail on no nock match for request

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

describe('Airtable to Google Sheets', async function () {
    afterEach(function () {
        if (!nock.isDone()) {
            this.test.error(new Error('Not all nock interceptors were used!'));
            nock.cleanAll();
        }
    });

    it('should update google sheets with reporting data from airtable', async function () {
        nock('https://api.airtable.com:443', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/Reporting')
            .query({ "fields%5B%5D": process.env.fields.split(', '), "filterByFormula": "XOR%28NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29%2C%20NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29%29", "sort%5B0%5D%5Bfield%5D": "ID", "sort%5B0%5D%5Bdirection%5D": "asc" })
            .reply(200, {
                "records": [
                    { "id": "airtableId1", "fields": { "ID": 1, "EventId": "eventId1", "ByBoatSails": ["byBoatId1"], "TotalCost": [0], "TotalPassengers": [0], "DisembarkingDate": "2020-01-01", "BoardingDate": "2020-01-01", "VesselConductingSail": ["Matthew Turner"], "CapacityWeight": 1, "SailingSegments": [1], "Paid": [0], "Outstanding": [0] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "EventId": "eventId2", "ByIndividualSails": ["byIndivId1", "byIndivId2"], "TotalCost": [0], "TotalPassengers": [0], "DisembarkingDate": "2020-01-07", "BoardingDate": "2020-01-02", "VesselConductingSail": ["Seaward"], "CapacityWeight": 1, "SailingSegments": [1], "Paid": [0], "Outstanding": [0] } }
                ]
            });

        nock('https://api.airtable.com:443', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
            .query({ "fields%5B%5D": "Sail_Id" })
            .reply(200, { "records": [{ "id": "byBoatId1", "fields": { "Sail_Id": 3 } }] });

        nock('https://api.airtable.com:443', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
            .query({ "fields%5B%5D": "Participant_Id" })
            .reply(200, {
                "records": [
                    { "id": "byIndivId1", "fields": { "Participant_Id": 4 } },
                    { "id": "byIndivId2", "fields": { "Participant_Id": 5 } }
                ]
            });

        /*
        nock('https://www.googleapis.com:443')
            .post('/oauth2/v4/token')
            .reply(200);
        */

        nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
            .post('/v4/spreadsheets/' + process.env.google_spreadsheet_id + ':batchUpdate', { "requests": [{ "updateSheetProperties": { "properties": { "sheetId": process.env.google_sheet_id, "gridProperties": { "frozenColumnCount": 1, "frozenRowCount": 1 } }, "fields": "gridProperties(frozenRowCount, frozenColumnCount)" } }] })
            .query({ "spreadsheetId": process.env.google_spreadsheet_id })
            .reply(200);

        nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
            .post('/v4/spreadsheets/' + process.env.google_spreadsheet_id + '/values/' + process.env.google_sheet_name + ':clear')
            .query({ "spreadsheetId": process.env.google_spreadsheet_id })
            .reply(200);

        nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
            .put('/v4/spreadsheets/' + process.env.google_spreadsheet_id + '/values/' + process.env.google_sheet_name, {
                "values": [process.env.fields.split(', '), [1, "eventId1", "3", null, "Matthew Turner", "0", "2020-01-01", "2020-01-01", "1", "0", 1, null, null, null, "0", "0"],
                [2, "eventId2", null, "4\n5", "Seaward", "0", "2020-01-02", "2020-01-07", "1", "0", 1, null, null, null, "0", "0"]]
            })
            .query({ "spreadsheetId": process.env.google_spreadsheet_id, "valueInputOption": "USER_ENTERED" })
            .reply(200);

        await tasks.airtableToGoogleSheets.main();
    });
});


describe('Airtable Reporting Sync', async function () {

    afterEach(function () {
        if (!nock.isDone()) {
            this.test.error(new Error('Not all nock interceptors were used!'));
            nock.cleanAll();
        }
    });


    it('should add by boat sail records to reporting table if missing', async function () {
        unlinkedReportingRecords({ "records": [] });

        linkedReportingRecords({ "records": [] });

        byBoatSails({
            "records": [
                { "id": "boatId1", "fields": { "EventId": "eventId1" } }
            ]
        });

        byIndividualSails({ "records": [] });

        var addRequest = {
            "records": [
                { "fields": { "EventId": "eventId1", "ByBoatSails": ["boatId1"] } }
            ]
        };

        var addResponse = {
            records: [
                { "id": "newId1" }
            ]
        };

        addReportingRecords(addRequest, addResponse);

        await tasks.syncReportingTable.main();
    });

    it('should add by individual sail records to reporting table if missing', async function () {
        unlinkedReportingRecords({ "records": [] });

        linkedReportingRecords({ "records": [] });

        byBoatSails({ "records": [] });

        byIndividualSails({
            "records": [
                { "id": "indivId1", "fields": { "EventId": "eventId1" } }
            ]
        });

        var addRequest = {
            "records": [
                { "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } }
            ]
        };

        var addResponse = {
            records: [
                { "id": "newId1" }
            ]
        };

        addReportingRecords(addRequest, addResponse);

        await tasks.syncReportingTable.main();
    });

    it('should update by boat sail records to reporting table if different', async function () {
        unlinkedReportingRecords({ "records": [] });

        linkedReportingRecords({
            "records": [
                { "id": "reportingId1", "fields": { "EventId": "eventId1", "ByBoatSails": ["boatId3"] } },
                { "id": "reportingId2", "fields": { "EventId": "eventId3", "ByBoatSails": ["boatId2"] } }
            ]
        });

        byBoatSails({
            "records": [
                { "id": "boatId1", "fields": { "EventId": "eventId1" } },
                { "id": "boatId2", "fields": { "EventId": "eventId2" } }
            ]
        });

        byIndividualSails({ "records": [] });

        var addRequest = {
            "records": [
                { "fields": { "EventId": "eventId1", "ByBoatSails": ["boatId1"] } },
                { "fields": { "EventId": "eventId2", "ByBoatSails": ["boatId2"] } }
            ]
        };

        var addResponse = {
            records: [
                { "id": "newId1" },
                { "id": "newId2" }
            ]
        };

        addReportingRecords(addRequest, addResponse);

        var deleteRequest = '?records%5B%5D=reportingId1&records%5B%5D=reportingId2';

        var deleteResponse = {
            records: [
                { deleted: true, id: 'reportingId1' },
                { deleted: true, id: 'reportingId2' }
            ]
        };

        deleteReportingRecords(deleteRequest, deleteResponse);

        await tasks.syncReportingTable.main();
    });

    it('should update by individual sail records to reporting table if different', async function () {
        unlinkedReportingRecords({ "records": [] });

        linkedReportingRecords({
            "records": [
                { "id": "reportingId1", "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId3"] } },
                { "id": "reportingId2", "fields": { "EventId": "eventId3", "ByIndividualSails": ["indivId2"] } }
            ]
        });

        byBoatSails({ "records": [] });

        byIndividualSails({
            "records": [
                { "id": "indivId1", "fields": { "EventId": "eventId1" } },
                { "id": "indivId2", "fields": { "EventId": "eventId2" } }
            ]
        });

        var addRequest = {
            "records": [
                { "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } },
                { "fields": { "EventId": "eventId2", "ByIndividualSails": ["indivId2"] } }
            ]
        };

        var addResponse = {
            records: [
                { "id": "newId1" },
                { "id": "newId2" }
            ]
        };

        addReportingRecords(addRequest, addResponse);

        var deleteRequest = '?records%5B%5D=reportingId1&records%5B%5D=reportingId2';

        var deleteResponse = {
            records: [
                { deleted: true, id: 'reportingId1' },
                { deleted: true, id: 'reportingId2' }
            ]
        };

        deleteReportingRecords(deleteRequest, deleteResponse);

        await tasks.syncReportingTable.main();
    });

    it('should not add any records to reporting table if already in sync', async function () {
        unlinkedReportingRecords({ "records": [] });

        linkedReportingRecords({
            "records": [
                { "id": "reportingId1", "fields": { "EventId": "eventId1", "ByBoatSails": ["boatId1"] } },
                { "id": "reportingId2", "fields": { "EventId": "eventId2", "ByIndividualSails": ["indivId1"] } }
            ]
        });

        byBoatSails({
            "records": [
                { "id": "boatId1", "fields": { "EventId": "eventId1" } }
            ]
        });

        byIndividualSails({
            "records": [
                { "id": "indivId1", "fields": { "EventId": "eventId2" } }
            ]
        });

        await tasks.syncReportingTable.main();
    });

    it('should remove records from reporting table if linked to both by boat and by individual sails or neither', async function () {
        unlinkedReportingRecords({
            "records": [
                { "id": "reportingId1" }
            ]
        });

        linkedReportingRecords({ "records": [] });

        byBoatSails({ "records": [] });

        byIndividualSails({ "records": [] });

        var deleteRequest = '?records%5B%5D=reportingId1';

        var deleteResponse = {
            records: [
                { deleted: true, id: 'reportingId1' }
            ]
        };

        deleteReportingRecords(deleteRequest, deleteResponse);

        await tasks.syncReportingTable.main();
    });

    it('should add, update, and remove records in reporting table simultaneously', async function () {
        unlinkedReportingRecords({
            "records": [
                { "id": "reportingId1" },
                { "id": "reportingId2" }]
        });

        linkedReportingRecords({
            "records": [
                { "id": "reportingId3", "fields": { "EventId": "eventId3", "ByBoatSails": ["boatId2"] } }
            ]
        });

        byBoatSails({
            "records": [
                { "id": "boatId1", "fields": { "EventId": "eventId2" } },
                { "id": "boatId2", "fields": { "EventId": "eventId4" } }
            ]
        });

        byIndividualSails({
            "records": [
                { "id": "indivId1", "fields": { "EventId": "eventId1" } }
            ]
        });

        var addRequest = {
            "records": [
                { "fields": { "EventId": "eventId2", "ByBoatSails": ["boatId1"] } },
                { "fields": { "EventId": "eventId4", "ByBoatSails": ["boatId2"] } },
                { "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } }
            ]
        };

        var addResponse = {
            records: [
                { "id": "newId1" },
                { "id": "newId2" }
            ]
        };

        addReportingRecords(addRequest, addResponse);

        var deleteRequest = '?records%5B%5D=reportingId1&records%5B%5D=reportingId2&records%5B%5D=reportingId3';

        var deleteResponse = {
            records: [
                { deleted: true, id: 'reportingId1' },
                { deleted: true, id: 'reportingId2' }
            ]
        };

        deleteReportingRecords(deleteRequest, deleteResponse);

        await tasks.syncReportingTable.main();
    });
});