const nock = require('nock');
const tasks = require('../tasks');
const utils = require('../utils-module');

const chai = require('chai')
const spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;

describe('Airtable', async function () {
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
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByBoatSails": ["Id1", "Id2"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByBoatSails": ["Id3", "Id4"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByBoatSails": ["Id5"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "multiple by boat records linked to one reporting record: Id1, Id2, Id3, Id4", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not multiple by boat records linked to one reporting record', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, { "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByBoatSails": ["Id1"] } }] });

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.not.have.been.called();
        });

        it('should post to slack if there are duplicate by boat sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByBoatSails": ["Id1"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByBoatSails": ["Id1"] } },
                    { "id": "airtableId3", "fields": { "ID": 3, "ByBoatSails": ["Id2"] } },
                    { "id": "airtableId4", "fields": { "ID": 4, "ByBoatSails": ["Id2"] } },
                    { "id": "airtableId4", "fields": { "ID": 4, "ByBoatSails": ["Id3"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "duplicate by boat sails in reporting table: Id1, Id2", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not duplicate by boat sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByBoatSails"], "filterByFormula": "NOT%28%7BByBoatSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByBoatSails": ["Id1"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByBoatSails": ["Id2"] } }]
                });

            await tasks.validateData.logBoatLinkErrors();
            expect(utils.Slack.post).to.not.have.been.called();
        });
    });

    describe('By Individual', async function () {
        it('should post to slack if there are duplicate by individual sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByIndividualSails"], "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByIndividualSails": ["Id1"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByIndividualSails": ["Id1"] } },
                    { "id": "airtableId3", "fields": { "ID": 3, "ByIndividualSails": ["Id2", "Id2"] } },
                    { "id": "airtableId4", "fields": { "ID": 4, "ByIndividualSails": ["Id3"] } },
                    { "id": "airtableId5", "fields": { "ID": 5, "ByIndividualSails": ["Id4", "Id3"] } }]
                });

            nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
                .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "duplicate by individual sails in reporting table: Id1, Id2, Id3", "link_names": 0, "icon_emoji": "" })
                .reply(200, "ok");

            await tasks.validateData.logIndividualLinkErrors();
            expect(utils.Slack.post).to.have.been.called.once;
        });

        it('should not post to slack if there are not duplicate by individual sails in reporting table', async function () {
            nock('https://api.airtable.com:443', { "encodedQueryParams": true })
                .get('/v0/appJdPg4q3BR7N0zb/Reporting')
                .query({ "fields%5B%5D": ["ID", "ByIndividualSails"], "filterByFormula": "NOT%28%7BByIndividualSails%7D%20%3D%20%27%27%29" })
                .reply(200, {
                    "records": [{ "id": "airtableId1", "fields": { "ID": 1, "ByIndividualSails": ["Id1, Id2"] } },
                    { "id": "airtableId2", "fields": { "ID": 2, "ByIndividualSails": ["Id3, Id4"] } }]
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
    });
});

