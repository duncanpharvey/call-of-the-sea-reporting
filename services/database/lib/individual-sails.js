const { format, moment, pool, Query, Slack } = require('../config.js');

async function get() {
    const sails = {};
    const sql = Query.IndividualSails.get;
    await pool.query(sql).then(res => {
        res.rows.forEach(record => {
            const boardingDateTime = moment(record.boarding_date, dateFormat);
            const disembarkingDateTime = moment(record.disembarking_date, dateFormat);
            sails[record.airtable_id] = {
                vessel_conducting_sail: record.vessel_conducting_sail,
                boarding_date: boardingDateTime.isValid() ? boardingDateTime.format(dateFormat) : null,
                disembarking_date: disembarkingDateTime.isValid() ? disembarkingDateTime.format(dateFormat) : null,
                status: record.status,
                total_cost: record.total_cost,
                scholarship_awarded: record.scholarship_awarded,
                paid: record.paid,
                outstanding: record.outstanding,
                passenger_capacity_override: record.passenger_capacity_override
            }
        });
    }).catch(err => Slack.post(err));
    return sails;
}

async function add(records) {
    const sql = {
        text: Query.IndividualSails.add
    };
    for (id of Object.keys(records)) {
        if (id.length != 17 || id.slice(0, 3) != 'rec') {
            Slack.post(`invalid airtable id: ${id}`);
            continue;
        }
        const record = records[id];
        sql.values = [
            id,
            record.vessel_conducting_sail,
            record.boarding_date,
            record.disembarking_date,
            record.status,
            record.total_cost,
            record.scholarship_awarded,
            record.paid,
            record.outstanding,
            record.passenger_capacity_override
        ];
        await pool.query(sql).then(Slack.post(`adding individual sail ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        var queryString = '';
        for (column of Object.keys(record)) { queryString += `${column} = '${record[column]}', `; }
        queryString += `modified_date_utc = timezone('utc', now())`;
        const sql = format(Query.IndividualSails.update, queryString, id);
        await pool.query(sql).then(Slack.post(`updating individual sail ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function remove(records) {
    const sql = {
        text: Query.IndividualSails.remove,
        values: [records]
    };
    await pool.query(sql).then(Slack.post(`removing individual sails ${JSON.stringify(records)}`)).catch(err => Slack.post(err));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
};