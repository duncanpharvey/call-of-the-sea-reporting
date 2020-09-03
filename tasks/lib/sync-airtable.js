const { Airtable, Eventbrite } = require('../../services');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncEventbrite() {
    const events = await Eventbrite.Events.get(true); // includes past events
    var eventbriteAttendees = {};

    for (event of events) { eventbriteAttendees = await Eventbrite.Attendees.get(event, eventbriteAttendees); }

    const airtableAttendees = await Airtable.IndividualSails.getEventbrite();

    const recordsToAdd = addedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToUpdate = updatedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToRemove = Object.keys(deletedDiff(airtableAttendees, eventbriteAttendees));

    console.log(Object.keys(recordsToAdd).length);
    console.log(Object.keys(recordsToUpdate).length);
    console.log(recordsToRemove.length); // todo: check for cancelled status

    console.log(Object.keys(eventbriteAttendees).length);
    console.log(Object.keys(airtableAttendees).length);

    // console.log(recordsToAdd);
}

async function main() {
    await syncEventbrite();
}

exports.main = main;