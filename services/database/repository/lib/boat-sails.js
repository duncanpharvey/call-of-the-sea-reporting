const get = 'select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, scholarship_awarded, paid, outstanding, total_passengers, students, adults from boat_sails;';

const add = `insert into boat_sails (
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
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;

const update = 'update boat_sails set %s where airtable_id = %L;';

const remove = 'delete from boat_sails where airtable_id = ANY($1);';

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
};