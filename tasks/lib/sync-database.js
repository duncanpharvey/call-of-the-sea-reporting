const { Airtable, Database} = require('../../services');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');
const { Slack } = require('../../utils');

async function syncCapacity() {
    const dbCapacity = await Database.Capacity.get();
    const airtableCapacity = await Airtable.Capacity.get();

    if (Object.keys(airtableCapacity).length == 0) {
        Slack.post('no airtable capacity found', process.env.slack_postgres_webhook_url);
        return;
    }

    const recordsToAdd = addedDiff(dbCapacity, airtableCapacity);
    const recordsToUpdate = updatedDiff(dbCapacity, airtableCapacity);
    const recordsToRemove = Object.keys(deletedDiff(dbCapacity, airtableCapacity));

    if (Object.keys(recordsToAdd).length > 0) await Database.Capacity.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.Capacity.update(recordsToUpdate);
    if (recordsToRemove.length > 0) await Database.Capacity.remove(recordsToRemove);
}

async function syncBoatSails() {
    const dbSails = await Database.BoatSails.get();
    const airtableSails = await Airtable.BoatSails.get();

    if (Object.keys(airtableSails).length == 0) {
        Slack.post('no airtable boat sails found', process.env.slack_postgres_webhook_url);
        return;
    }

    const recordsToAdd = addedDiff(dbSails, airtableSails);
    const recordsToUpdate = updatedDiff(dbSails, airtableSails);
    const recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.BoatSails.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.BoatSails.update(recordsToUpdate);
    if (recordsToRemove.length > 0) await Database.BoatSails.remove(recordsToRemove);
}

async function syncIndividualSails() {
    const dbSails = await Database.IndividualSails.get();
    const airtableSails = await Airtable.IndividualSails.get();
    
    if (Object.keys(airtableSails).length == 0) {
        Slack.post('no airtable individual sails found', process.env.slack_postgres_webhook_url);
        return;
    }

    const recordsToAdd = addedDiff(dbSails, airtableSails);
    const recordsToUpdate = updatedDiff(dbSails, airtableSails);
    const recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.IndividualSails.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.IndividualSails.update(recordsToUpdate);
    if (recordsToRemove.length > 0) await Database.IndividualSails.remove(recordsToRemove);
}

async function main() {
    Slack.post('beginning airtable and postgres sync', process.env.slack_postgres_webhook_url);
    await Database.Calendar.update();
    await syncCapacity();
    await syncBoatSails();
    await syncIndividualSails();
    Slack.post('airtable and postgres sync complete', process.env.slack_postgres_webhook_url);
}

exports.main = main;