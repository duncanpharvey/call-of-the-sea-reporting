const { Airtable, Eventbrite } = require('../../services');
const { diff, addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncEventbrite() {
    const events = await Eventbrite.Events.get(true); // includes past events
    var eventbriteAttendees = {};

    for (event of events) { eventbriteAttendees = await Eventbrite.Attendees.get(event, eventbriteAttendees); }

    const result = await Airtable.IndividualSails.getEventbrite();
    const airtableAttendees = result[0];
    const map = result[1];

    const recordsToAdd = addedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToUpdate = updatedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToRemove = Object.keys(deletedDiff(airtableAttendees, eventbriteAttendees));

    console.log('add:        ', Object.keys(recordsToAdd).length);
    console.log('update:     ', Object.keys(recordsToUpdate).length);
    console.log('remove:     ', recordsToRemove.length);

    console.log('---------------------')
    console.log('eventbrite: ', Object.keys(eventbriteAttendees).length);
    console.log('airtable:   ', Object.keys(airtableAttendees).length);

    Airtable.IndividualSails.add(recordsToAdd);
    Airtable.IndividualSails.update(recordsToUpdate, map);
    Airtable.IndividualSails.cancel(recordsToRemove, map);

    Airtable.IndividualSails.report(airtableAttendees, eventbriteAttendees, map, Object.keys(recordsToUpdate), Object.keys(recordsToAdd));
}

async function main() {
    await syncEventbrite();
}

exports.main = main;