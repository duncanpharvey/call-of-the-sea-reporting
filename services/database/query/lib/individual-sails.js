const get = 'select airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, scholarship_awarded, paid, outstanding, passenger_capacity_override, eventbrite_event_id, eventbrite_order_id, eventbrite_attendee_id from individual_sails;';

const add = `insert into individual_sails (
    airtable_id,
    vessel_conducting_sail,
    boarding_date,
    disembarking_date,
    status,
    total_cost,
    scholarship_awarded,
    paid,
    outstanding,
    passenger_capacity_override,
    eventbrite_event_id,
    eventbrite_order_id,
    eventbrite_attendee_id
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`;

const update = 'update individual_sails set %s where airtable_id = %L;';

const remove = 'delete from individual_sails where airtable_id = ANY($1);';


module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}