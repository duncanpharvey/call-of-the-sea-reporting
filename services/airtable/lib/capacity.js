const { Slack } = require('../config.js');
const request = require('../request-handler.js');

async function get() {
    const capacity = {};
    const fields = ['Id', 'Day', 'Value'];
    await request.get('Capacity', fields).then(records => {
        records.forEach(record => {
            const day = record.fields.Day;
            const value = record.fields.Value;
            capacity[record.fields.Id] = {
                day: day ? day.toLowerCase() : null,
                value: value ? value : 0
            };
        })
    }).catch(err => Slack.post(err));
    return capacity;
}

module.exports = {
    get: get
};