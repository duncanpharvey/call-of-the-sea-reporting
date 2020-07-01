const { nock } = require('../../config.js');

function get(response) {
    nock('https://api.airtable.com:443')
        .get(`/v0/${process.env.airtable_base_id}/Capacity`)
        .query({ 'fields[]': ['Id', 'Day', 'Value'] })
        .reply(200, { 'records': response });
}

module.exports = {
    get: get
};