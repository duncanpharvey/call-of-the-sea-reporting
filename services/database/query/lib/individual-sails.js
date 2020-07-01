const get = 'select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, scholarship_awarded, paid, outstanding from individual_sails;';

const add = `insert into individual_sails (
    airtable_id,
    vessel_conducting_sail,
    boarding_date,
    disembarking_date,
    status,
    total_cost,
    scholarship_awarded,
    paid,
    outstanding
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;

const update = 'update individual_sails set %s where airtable_id = %L;';

const remove = 'delete from individual_sails where airtable_id = ANY($1);';


module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}