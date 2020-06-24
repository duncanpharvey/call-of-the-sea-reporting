const { format, moment, pool, Slack } = require('../config.js');

async function get() {
    const sails = {};
    const sql = 'select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost from individual_sails;';
    await pool.query(sql).then(res => {
        res.rows.forEach(record => {
            sails[record.airtable_id] = {
                vesselConductingSail: record.vessel_conducting_sail,
                boardingDateTime: moment(record.boarding_date, dateFormat).format(dateFormat),
                disembarkingDateTime: moment(record.disembarking_date, dateFormat).format(dateFormat),
                status: record.status,
                totalCost: record.total_cost
            }
        });
    }).catch(err => Slack.post(JSON.stringify(err)));
    return sails;
}

async function add(records) {
    const sql = {
        text: `insert into individual_sails (
            airtable_id,
            vessel_conducting_sail,
            boarding_date,
            disembarking_date,
            status,
            total_cost
            ) values ($1, $2, $3, $4, $5, $6);`
    };
    for (id of Object.keys(records)) {
        if (id.length != 17 || id.slice(0, 3) != 'rec') {
            Slack.post(`invalid airtable id: ${id}`);
            continue;
        }
        sql.values = [
            id,
            records[id].vesselConductingSail,
            records[id].boardingDateTime,
            records[id].disembarkingDateTime,
            records[id].status,
            records[id].totalCost
        ];
        await pool.query(sql).then(Slack.post(`adding individual sail ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        var queryString = '';
        for (column of Object.keys(record)) { queryString += `${column} = '${record[column]}',`; }
        const sql = format('update individual_sails set %s where airtable_id = %L;', queryString.slice(0, -1), id);
        await pool.query(sql).then(Slack.post(`updating individual sail ${id}: ${JSON.stringify(records[id])}`));
    }
}

async function remove(records) {
    const sql = {
        text: 'delete from individual_sails where airtable_id = ANY($1);',
        values: [records]
    };
    await pool.query(sql).then(Slack.post(`removing boat sails ${JSON.stringify(records)}`)).catch(err => Slack.post(JSON.stringify(err)));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
};