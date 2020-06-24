const Airtable = require('airtable');
const { Slack } = require('../utils');

module.exports = {
    airtableDateFormat: 'YYYY-MM-DD hh:mm a',
    base: new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id),
    moment: require('moment'),
    Slack: Slack
};