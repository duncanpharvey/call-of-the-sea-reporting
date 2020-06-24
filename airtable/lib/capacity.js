const { base, Slack } = require('../config.js');

async function get() {
    const capacity = {};
    await base('Capacity').select({
        fields: ['Id', 'Day', 'Value']
    }).all().then(records => {
        records.forEach(record => {
            capacity[record.get('Id')] = {
                day: record.get('Day').toLowerCase(),
                value: record.get('Value')
            };
        })
    }).catch(err => Slack.post(JSON.stringify(err)));
    return capacity;
}

module.exports = {
    get: get
};