const { Airtable, Eventbrite } = require('../../services');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

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

    Airtable.IndividualSails.add(recordsToAdd);
    Airtable.IndividualSails.update(recordsToUpdate, map);
    Airtable.IndividualSails.cancel(recordsToRemove, map);
}

async function main() {
    await syncEventbrite();
}

exports.main = main;