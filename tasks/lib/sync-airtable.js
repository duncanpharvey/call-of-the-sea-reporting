const { Airtable, Eventbrite } = require('../../services');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');
const { Slack } = require('../../utils');

async function syncEventbrite() {
    const sails = await Eventbrite.Events.get(true); // includes past events
    var eventbriteAttendees = {};

    for (sail of sails) { eventbriteAttendees = await Eventbrite.Attendees.get(sail, eventbriteAttendees); }

    const result = await Airtable.IndividualSails.getEventbrite();
    const airtableAttendees = result[0];
    const map = result[1];

    if (Object.keys(airtableAttendees).length == 0) {
        Slack.post('no airtable attendees found', process.env.slack_airtable_webhook_url);
        return;
    }

    const recordsToAdd = addedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToUpdate = updatedDiff(airtableAttendees, eventbriteAttendees);
    const recordsToRemove = Object.keys(deletedDiff(airtableAttendees, eventbriteAttendees));

    Airtable.IndividualSails.add(recordsToAdd);
    Airtable.IndividualSails.update(recordsToUpdate, map);
    Airtable.IndividualSails.cancel(recordsToRemove, map);
}

async function main() {
    Slack.post('beginning eventbrite and airtable sync', process.env.slack_airtable_webhook_url);
    await syncEventbrite();
    Slack.post('eventbrite and airtable sync complete', process.env.slack_airtable_webhook_url);
}

exports.main = main;