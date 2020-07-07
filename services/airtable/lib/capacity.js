const Config = require('../config.js');

async function get() {
    const capacity = {};
    const fields = ['Id', 'Day', 'Value'];
    await Config.request('Capacity', fields).then(records => {
        records.forEach(record => {
            const day = record.fields.Day;
            const value = record.fields.Value;
            capacity[record.fields.Id] = {
                day: day ? day.toLowerCase() : null,
                value: value ? value : 0
            };
        })
    }).catch(err => Config.Slack.post(err));
    return capacity;
}

module.exports = {
    get: get
};