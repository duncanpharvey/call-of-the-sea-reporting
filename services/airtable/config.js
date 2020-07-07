const Airtable = require('airtable');
const { Slack } = require('../../utils');

const base = new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id);

async function request(table, fields) {
    return await base(table).select({ fields: fields }).all().then((records) => records.map(r => r._rawJson));
}

module.exports = {
    airtableDateFormat: 'YYYY-MM-DD h:mm a',
    moment: require('moment'),
    request: request,
    Slack: Slack,
};