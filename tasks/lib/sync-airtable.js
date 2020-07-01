const Eventbrite = require('../../eventbrite');
const Airtable = require('../../airtable');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncEventbrite() {
    const events = await Eventbrite.Events.get(true);
    var attendees = [];
    for (event of events) {
        attendees = attendees.concat(await Eventbrite.Attendees.get(event.id));
    }

    const airtableAttendees = await Airtable.Capacity.get();

    const recordsToAdd = addedDiff(dbCapacity, airtableCapacity);
    const recordsToUpdate = updatedDiff(dbCapacity, airtableCapacity);
    const recordsToRemove = Object.keys(deletedDiff(dbCapacity, airtableCapacity));

    if (Object.keys(recordsToAdd).length > 0) await Database.Capacity.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.Capacity.update(recordsToUpdate);
    if (recordsToRemove.length > 0) await Database.Capacity.remove(recordsToRemove);
}

async function main() {
    await syncEventbrite();
}

exports.main = main;