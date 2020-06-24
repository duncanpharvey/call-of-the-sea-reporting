const { format, pool, Slack } = require('../config.js');

async function get() {
    const capacity = {};
    const sql = 'select id, day, value from capacity;';
    await pool.query(sql)
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
    const sql = { text: 'insert into capacity (id, day, value) values ($1, $2, $3);' }
    for (id of Object.keys(records)) {
        sql.values = [id, records[id].day, records[id].value];
        await pool.query(sql).then(Slack.post(`adding capacity ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        var queryString = '';
        for (column of Object.keys(record)) { queryString += `${column} = '${record[column]}',`; }
        const sql = format('update capacity set %s where id = %L;', queryString.slice(0, -1), id);
        await pool.query(sql).then(Slack.post(`updating capacity ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function remove(records) {
    const sql = {
        text: 'delete from capacity where id = ANY($1);',
        values: [records]
    }
    await pool.query(sql).then(Slack.post(`removing capacities ${JSON.stringify(records)}`)).catch(err => Slack.post(JSON.stringify(err)));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}