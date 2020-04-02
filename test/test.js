const nock = require('nock');
const tasks = require('../tasks');
const utils = require('../utils-module');

const chai = require('chai')
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;

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
            .query({ "fields%5B%5D": process.env.fields.split(', '), "filterByFormula": "OR%28NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29%2C%20NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29%29", "sort%5B0%5D%5Bfield%5D": "ID", "sort%5B0%5D%5Bdirection%5D": "asc" })
            .reply(200, {
                "records": [{ "id": "airtableId1", "fields": { "ID": 1, "EventId": "eventId1", "ByBoatSails": ["byBoatId1"], "TotalCost": [0], "TotalPassengers": [0], "DisembarkingDate": "2020-01-01", "BoardingDate": "2020-01-01", "VesselConductingSail": ["Matthew Turner"], "CapacityWeight": 1, "SailingSegments": [1], "Paid": [0], "Outstanding": [0] } },
                { "id": "airtableId2", "fields": { "ID": 2, "EventId": "eventId2", "ByIndividualSails": ["byIndivId1", "byIndivId2"], "TotalCost": [0], "TotalPassengers": [0], "DisembarkingDate": "2020-01-07", "BoardingDate": "2020-01-02", "VesselConductingSail": ["Seaward"], "CapacityWeight": 1, "SailingSegments": [1], "Paid": [0], "Outstanding": [0] } }]
            });

        nock('https://api.airtable.com:443', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
            .query({ "fields%5B%5D": "Sail_Id" })
            .reply(200, { "records": [{ "id": "byBoatId1", "fields": { "Sail_Id": 3 } }] });

        nock('https://api.airtable.com:443', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
            .query({ "fields%5B%5D": "Participant_Id" })
            .reply(200, {
                "records": [{ "id": "byIndivId1", "fields": { "Participant_Id": 4 } },
                { "id": "byIndivId2", "fields": { "Participant_Id": 5 } }]
            });

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

describe('Airtable Data Integrity', async function () {
    beforeEach(function () {
        chai.spy.on(utils.Slack, 'post');
    });

    afterEach(function () {
        chai.spy.restore(utils.Slack);

        if (!nock.isDone()) {
            this.test.error(new Error('Not all nock interceptors were used!'));
            nock.cleanAll();
        }
    });

    describe('By Boat', async function () {
        it('should post to slack if there are multiple by boat records linked to one reporting record', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ByBoatSails", "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ByBoatSails": ["id1", "id2"] } },
                    { "id": "airtableId2", "fields": { "ByBoatSails": ["id3", "id4"] } },
                    { "id": "airtableId2", "fields": { "ByBoatSails": ["id5"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "multiple by boat records linked to one reporting record: id1, id2, id3, id4", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should post to slack if there are duplicate by boat sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ByBoatSails", "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ByBoatSails": ["id1"] } },
                    { "id": "airtableId2", "fields": { "ByBoatSails": ["id1"] } },
                    { "id": "airtableId3", "fields": { "ByBoatSails": ["id2"] } },
                    { "id": "airtableId4", "fields": { "ByBoatSails": ["id2"] } },
                    { "id": "airtableId4", "fields": { "ByBoatSails": ["id3"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "duplicate by boat sails in reporting table: id1, id2", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not multiple by boat records linked to one reporting record and no duplicate by boat sails', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ByBoatSails", "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ByBoatSails": ["id1"] } },
                    { "id": "airtableId2", "fields": { "ByBoatSails": ["id2"] } }]
                });

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.not.have.been.called();
        });
    });

    describe('By Individual', async function () {
        it('should post to slack if there are duplicate by individual sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ByIndividualSails", "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ByIndividualSails": ["id1"] } },
                    { "id": "airtableId2", "fields": { "ByIndividualSails": ["id1"] } },
                    { "id": "airtableId3", "fields": { "ByIndividualSails": ["id2", "id2"] } },
                    { "id": "airtableId4", "fields": { "ByIndividualSails": ["id3"] } },
                    { "id": "airtableId5", "fields": { "ByIndividualSails": ["id4", "id3"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "duplicate by individual sails in reporting table: id1, id2, id3", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logIndividualLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not duplicate by individual sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ByIndividualSails", "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ByIndividualSails": ["id1, id2"] } },
                    { "id": "airtableId2", "fields": { "ByIndividualSails": ["id3, id4"] } }]
                });

            await tasks.validateData.logIndividualLinkErrors();
            expect(utils.Slack.post).to.not.have.been.called();
        });
    });

    describe('Reporting', async function () {
        it('should post to slack if there are unlinked reporting records', async function () {
            nock('https://api.airtable.com', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ID", "filterByFormula": "AND%28%7BByBoatSails%7D%20%3D%20%27%27%2C%20%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1" },
                    { "id": "airtableId2" }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "unlinked reporting records: airtableId1, airtableId2", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logUnlinkedReportingRecords();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are no unlinked reporting records', async function () {
            nock('https://api.airtable.com', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": "ID", "filterByFormula": "AND%28%7BByBoatSails%7D%20%3D%20%27%27%2C%20%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [] });

            await tasks.validateData.logUnlinkedReportingRecords();
            expect(utils.Slack.post).not.to.have.been.called();
        });

        it('should post to slack if there are missing reporting records', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByIndividualSails"], "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId1", "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId2", "fields": { "EventId": "eventId2", "ByBoatSails": ["boatId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, {
                    "records": [{ "id": "indivId1", "fields": { "EventId": "eventId1" } },
                    { "id": "indivId2", "fields": { "EventId": "eventId3" } }]
                });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, {
                    "records": [{ "id": "boatId1", "fields": { "EventId": "eventId2" } },
                    { "id": "boatId2", "fields": { "EventId": "eventId4" } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "missing records in reporting table: indivId2, boatId2", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logEventIdLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should post to slack if eventIds are not linked properly', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByIndividualSails"], "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId1", "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId2", "fields": { "EventId": "eventId2", "ByBoatSails": ["boatId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, {
                    "records": [{ "id": "indivId1", "fields": { "EventId": "eventId3" } }]
                });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, {
                    "records": [{ "id": "boatId1", "fields": { "EventId": "eventId4" } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "eventIds not linked properly for records: indivId1, boatId1", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logEventIdLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not missing reporting records and eventIds are linked properly', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByIndividualSails"], "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId1", "fields": { "EventId": "eventId1", "ByIndividualSails": ["indivId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/Reporting')
                .query({ "fields%5B%5D": ["EventId", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId2", "fields": { "EventId": "eventId2", "ByBoatSails": ["boatId1"] } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Individual%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, { "records": [{ "id": "indivId1", "fields": { "EventId": "eventId1" } }] });

            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/' + process.env.airtable_base_id + '/By%20Boat%20Sails')
                .query({ "fields%5B%5D": "EventId", "filterByFormula": "NOT%28%7BStatus%7D%20%3D%20%27Cancelled%27%29" })
                .reply(200, { "records": [{ "id": "boatId1", "fields": { "EventId": "eventId2" } }] });

            await tasks.validateData.logEventIdLinkErrors();
            expect(utils.Slack.post).not.to.have.been.called();
        });
    });
});