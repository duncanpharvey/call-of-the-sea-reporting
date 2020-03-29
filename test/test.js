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
    })
    afterEach(function () {
        chai.spy.restore(utils.Slack);
    })
    it('should post to slack if there are unlinked reporting records', async function () {
        nock('https://api.airtable.com', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/Reporting')
            .query({ "fields%5B%5D": "ID", "filterByFormula": "AND%28%7BByBoatSails%7D%20%3D%20%27%27%2C%20%7BByIndividualSails%7D%20%3D%20%27%27%29" })
            .reply(200, { "records": [{ "id": "testid1" }, { "id": "testid2" }] });

        nock(process.env.slack_webhook_url.slice(0, 23), { "encodedQueryParams": true })
            .post(process.env.slack_webhook_url.slice(23, 79), { "response_type": "ephemeral", "channel": process.env.slack_channel, "text": "unlinked reporting records: testid1, testid2", "link_names": 0, "icon_emoji": "" })
            .reply(200, "ok");

        await tasks.validateData.logUnlinkedReportingRecords();
        expect(utils.Slack.post).to.have.been.called();;
    });

    it('should not post to slack if there are no unlinked reporting records', async function () {
        nock('https://api.airtable.com', { "encodedQueryParams": true })
            .get('/v0/' + process.env.airtable_base_id + '/Reporting')
            .query({ "fields%5B%5D": "ID", "filterByFormula": "AND%28%7BByBoatSails%7D%20%3D%20%27%27%2C%20%7BByIndividualSails%7D%20%3D%20%27%27%29" })
            .reply(200, { "records": [] });

        await tasks.validateData.logUnlinkedReportingRecords();
        expect(utils.Slack.post).not.to.have.been.called();;
    });
});

