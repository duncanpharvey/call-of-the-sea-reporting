const { base, Slack } = require('../config.js');

async function get() {
    const capacity = {};
    await base('Capacity').select({
        fields: ['Id', 'Day', 'Value']
    }).all().then(records => {
        records.forEach(record => {
            const day = record.get('Day');
            const value = record.get('Value');
            capacity[record.get('Id')] = {
                day: day ? day.toLowerCase() : null,
                value: value ? value: 0
            };
        })
    }).catch(err => Slack.post(err));
    return capacity;
}

module.exports = {
    get: get
};