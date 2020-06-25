const { format, moment, pool, Slack } = require('../config.js');

async function get() {
    const sails = {};
    const sql = 'select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, scholarship_awarded, paid, outstanding, total_passengers, students, adults from boat_sails;';
    await pool.query(sql).then(res => {
        res.rows.forEach(record => {
            sails[record.airtable_id] = {
                vessel_conducting_sail: record.vessel_conducting_sail,
                boarding_date: moment(record.boarding_date, dateFormat).format(dateFormat),
                disembarking_date: moment(record.disembarking_date, dateFormat).format(dateFormat),
                status: record.status,
                total_cost: record.total_cost,
                scholarship_awarded: record.scholarship_awarded,
                paid: record.paid,
                outstanding: record.outstanding,
                total_passengers: record.total_passengers,
                students: record.students,
                adults: record.adults
            }
        });
    }).catch(err => Slack.post(err));
    return sails;
}

async function add(records) {
    const sql = {
        text: `insert into boat_sails (
            airtable_id,
            vessel_conducting_sail,
            boarding_date,
            disembarking_date,
            status,
            total_cost,
            scholarship_awarded,
            paid,
            outstanding,
            total_passengers,
            students,
            adults
            ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`
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
            record.total_passengers,
            record.students,
            record.adults
        ];
        await pool.query(sql).then(Slack.post(`adding boat sail ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function update(records) {
    for (id of Object.keys(records)) {
        const record = records[id];
        var queryString = '';
        for (column of Object.keys(record)) { queryString += `${column} = '${record[column]}', `; }
        queryString += `modified_date_utc = timezone('utc', now())`;
        const sql = format('update boat_sails set %s where airtable_id = %L;', queryString, id);
        await pool.query(sql).then(Slack.post(`updating boat sail ${id}: ${JSON.stringify(record)}`)).catch(err => Slack.post(err));
    }
}

async function remove(records) {
    const sql = {
        text: 'delete from boat_sails where airtable_id = ANY($1);',
        values: [records]
    };
    await pool.query(sql).then(Slack.post(`removing boat sails ${JSON.stringify(records)}`)).catch(err => Slack.post(err));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
};