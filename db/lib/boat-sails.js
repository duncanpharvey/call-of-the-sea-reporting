const { moment, pool, Slack } = require('../config.js');

async function get() {
    var sails = {};
    await pool.query('select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, total_passengers from boat_sails;')
        .then(res => {
            res.rows.forEach(record => {
                sails[record.airtable_id] = {
                    vesselConductingSail: record.vessel_conducting_sail,
                    boardingDateTime: moment(record.boarding_date, dateFormat).format(dateFormat),
                    disembarkingDateTime: moment(record.disembarking_date, dateFormat).format(dateFormat),
                    status: record.status,
                    totalCost: record.total_cost,
                    totalPassengers: record.total_passengers
                }
            });
        }).catch(err => Slack.post(JSON.stringify(err)));
    return sails;
}

async function add(records) {
    for (id of Object.keys(records)) {
        if (id.length != 17 || id.slice(0, 3) != 'rec') {
            Slack.post(`invalid airtable id: ${id}`);
            continue;
        }
        await pool.query({
            text: `insert into boat_sails (airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, total_passengers)
                values ($1, $2, $3, $4, $5, $6, $7);`,
            values: [
                id,
                records[id].vesselConductingSail,
                records[id].boardingDateTime,
                records[id].disembarkingDateTime,
                records[id].status ? records[id].status : 'Scheduled',
                records[id].totalCost,
                records[id].totalPassengers
            ]
        }).then(Slack.post(`adding boat sail ${id}: ${JSON.stringify(records[id])}`)).catch(err => Slack.post(JSON.stringify(err)));
    }
}

async function update(records) {
}

async function remove(records) {
    await pool.query({
        text: 'delete from boat_sails where airtable_id = ANY($1);',
        values: [records]
    }).then(Slack.post(`removing boat sails ${JSON.stringify(records)}`)).catch(err => Slack.post(JSON.stringify(err)));
}

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
};