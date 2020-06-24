const moment = require('moment');
const slack = require('./slack.js');

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getCapacity() {
    var capacity = {};
    await pool.query('select id, day, value from capacity;')
        .then(res => {
            res.rows.forEach(record => {
                capacity[record.id] = {
                    day: record.day,
                    value: record.value
                };
            });
        });
    return capacity;
}

async function getBoatSails() {
    var sails = {};
    await pool.query('select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, total_passengers from boat_sails;')
        .then(res => {
            res.rows.forEach(record => {
                sails[record.airtable_id] = {
                    vesselConductingSail: record.vessel_conducting_sail,
                    boardingDateTime: moment(record.boarding_date, date_format).format(date_format),
                    disembarkingDateTime: moment(record.disembarking_date, date_format).format(date_format),
                    status: record.status,
                    totalCost: record.total_cost,
                    totalPassengers: record.total_passengers
                }
            });
        });
    return sails;
}

async function getIndividualSails() {
    var sails = {};
    await pool.query('select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost from individual_sails;')
        .then(res => {
            res.rows.forEach(record => {
                sails[record.airtable_id] = {
                    vesselConductingSail: record.vessel_conducting_sail,
                    boardingDateTime: moment(record.boarding_date, date_format).format(date_format),
                    disembarkingDateTime: moment(record.disembarking_date, date_format).format(date_format),
                    status: record.status,
                    totalCost: record.total_cost
                }
            });
        });
    return sails;
}

async function addCapacity(records) {
    for (id of Object.keys(records)) {
        await pool.query({
            text: 'insert into capacity (id, day, value) values ($1, $2, $3);',
            values: [
                id,
                records[id].day,
                records[id].value
            ]
        });
    }
    slack.post(`adding capacities ${JSON.stringify(records)}`);
}

async function addBoatSails(records) {
    for (id of Object.keys(records)) {
        await pool.query({
            text: `insert into boat_sails (airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, total_passengers)
                values ($1, $2, $3, $4, $5, $6, $7);`,
            values: [
                id,
                records[id].vesselConductingSail,
                records[id].boardingDateTime,
                records[id].disembarkingDateTime,
                records[id].status,
                records[id].totalCost,
                records[id].totalPassengers
            ]
        });
    }
    slack.post(`adding boat sails ${JSON.stringify(records)}`);
}

async function addIndividualSails(records) {
    for (id of Object.keys(records)) {
        // add validation for airtable_id
        await pool.query({
            text: `insert into individual_sails (airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost)
                values ($1, $2, $3, $4, $5, $6);`,
            values: [
                id,
                records[id].vesselConductingSail,
                records[id].boardingDateTime,
                records[id].disembarkingDateTime,
                records[id].status,
                records[id].totalCost
            ]
        });
    }
    slack.post(`adding individual sails ${JSON.stringify(records)}`);
}

async function updateCalendar() {
    await pool.query(`do $$
        declare
        check_date date := greatest('2019-06-01', (select max(date) from calendar) + INTERVAL '1 day');
        end_date date := current_date + INTERVAL '2 years';
        
        begin
        while check_date <= end_date loop
        insert into calendar(date) values(check_date);
        check_date := check_date + INTERVAL '1 day';
        end loop;
        end $$;`);
}

async function updateCapacity(records) {
    for (id of Object.keys(records)) {
        await pool.query({
            text: 'update capacity set value = $1 where id = $2',
            values: [
                records[id].value,
                id
            ]
        });
    }
    slack.post(`updating capacities ${JSON.stringify(records)}`);
}

async function updateBoatSails(records) {
    slack.post(`updating boat sails ${JSON.stringify(records)}`);
}

async function updateIndividualSails(records) {
    slack.post(`updating individual sails ${JSON.stringify(records)}`);
}

async function deleteCapacity(records) {
    await pool.query({
        text: 'delete from capacity where id = ANY($1);',
        values: [records]
    });
    slack.post(`deleting capacities ${JSON.stringify(records)}`);
}

async function deleteBoatSails(records) {
    await pool.query({
        text: 'delete from boat_sails where airtable_id = ANY($1);',
        values: [records]
    });
    slack.post(`deleting boat sails ${JSON.stringify(records)}`);
}

async function deleteIndividualSails(records) {
    await pool.query({
        text: 'delete from individual_sails where airtable_id = ANY($1);',
        values: [records]
    });
    slack.post(`deleting individual sails ${JSON.stringify(records)}`);
}

module.exports = {
    getCapacity: getCapacity,
    getBoatSails: getBoatSails,
    getIndividualSails: getIndividualSails,
    addCapacity: addCapacity,
    addBoatSails: addBoatSails,
    addIndividualSails: addIndividualSails,
    updateCalendar: updateCalendar,
    updateCapacity: updateCapacity,
    updateBoatSails: updateBoatSails,
    updateIndividualSails: updateIndividualSails,
    deleteCapacity: deleteCapacity,
    deleteBoatSails: deleteBoatSails,
    deleteIndividualSails: deleteIndividualSails
};