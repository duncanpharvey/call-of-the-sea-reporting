const { format, Repository, Slack } = require('../config.js');
const pool = require('../query-handler.js');

async function get() {
    const capacity = {};
    await pool.get(Repository.Capacity.get).then(records => {
        records.forEach(record => {
            capacity[record.id] = {
                day: record.day,
                value: record.value
            };
        });
    }).catch(err => Slack.post(err));
    return capacity;
}

async function add(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        const values = [id, record.day, record.value];
        await pool.query(Repository.Capacity.add, values).then(Slack.post(`adding capacity ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        var queryString = '';
        for (column of Object.keys(record)) { queryString += `${column} = '${record[column]}', `; }
        queryString += `modified_date_utc = timezone('utc', now())`;
        const sql = format(Repository.Capacity.update, queryString, id);
        await pool.query(sql).then(Slack.post(`updating capacity ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function remove(records) {
    const sql = {
        text: Repository.Capacity.remove,
        values: [records]
    }
    await pool.query(sql).then(Slack.post(`removing capacities ${JSON.stringify(records)}`)).catch(err => Slack.post(err));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}