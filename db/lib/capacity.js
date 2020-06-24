const { pool, Slack } = require('../config.js');

async function get() {
    var capacity = {};
    await pool.query('select id, day, value from capacity;')
        .then(res => {
            res.rows.forEach(record => {
                capacity[record.id] = {
                    day: record.day,
                    value: record.value
                };
            });
        }).catch(err => Slack.post(JSON.stringify(err)));
    return capacity;
}

async function add(records) {
    for (id of Object.keys(records)) {
        await pool.query({
            text: 'insert into capacity (id, day, value) values ($1, $2, $3);',
            values: [
                id,
                records[id].day,
                records[id].value
            ]
        }).then(Slack.post(`adding capacity ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        await pool.query({
            text: 'update capacity set value = $1 where id = $2',
            values: [
                records[id].value,
                id
            ]
        }).then(Slack.post(`updating capacity ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function remove(records) {
    await pool.query({
        text: 'delete from capacity where id = ANY($1);',
        values: [records]
    }).then(Slack.post(`removing capacities ${JSON.stringify(records)}`)).catch(err => Slack.post(JSON.stringify(err)));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}