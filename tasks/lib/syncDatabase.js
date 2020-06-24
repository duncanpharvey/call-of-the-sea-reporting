const utils = require('../../utils');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncCapacity() {
    var db_capacity = await utils.Database.getCapacity().catch(err => utils.Slack.post(JSON.stringify(err)));
    var airtable_capacity = await utils.Airtable.getCapacity().catch(err => utils.Slack.post(JSON.stringify(err)));

    var records_to_add = addedDiff(db_capacity, airtable_capacity);
    var records_to_update = updatedDiff(db_capacity, airtable_capacity);
    var records_to_delete = Object.keys(deletedDiff(db_capacity, airtable_capacity));

    if (Object.keys(records_to_add).length > 0) await utils.Database.addCapacity(records_to_add).catch(err => utils.Slack.post(JSON.stringify(err)));
    if (Object.keys(records_to_update).length > 0) await utils.Database.updateCapacity(records_to_update).catch(err => utils.Slack.post(JSON.stringify(err)));
    if (records_to_delete.length > 0) await utils.Database.deleteCapacity(records_to_delete).catch(err => utils.Slack.post(JSON.stringify(err)));
}

async function syncBoatSails() {
    var db_sails = await utils.Database.getBoatSails().catch(err => utils.Slack.post(JSON.stringify(err)));
    var airtable_sails = await utils.Airtable.getBoatSails().catch(err => utils.Slack.post(JSON.stringify(err)));

    var records_to_add = addedDiff(db_sails, airtable_sails);
    var records_to_update = updatedDiff(db_sails, airtable_sails);
    var records_to_delete = Object.keys(deletedDiff(db_sails, airtable_sails));
    
    if (Object.keys(records_to_add).length > 0) await utils.Database.addBoatSails(records_to_add).catch(err => utils.Slack.post(JSON.stringify(err)));
    if (Object.keys(records_to_delete).length > 0) await utils.Database.deleteBoatSails(records_to_delete).catch(err => utils.Slack.post(JSON.stringify(err)));
}

async function syncIndividualSails() {
    var db_sails = await utils.Database.getIndividualSails().catch(err => utils.Slack.post(JSON.stringify(err)));
    var airtable_sails = await utils.Airtable.getIndividualSails().catch(err => utils.Slack.post(JSON.stringify(err)));

    var records_to_add = addedDiff(db_sails, airtable_sails);
    var records_to_update = updatedDiff(db_sails, airtable_sails);
    var records_to_delete = Object.keys(deletedDiff(db_sails, airtable_sails));
    
    if (Object.keys(records_to_add).length > 0) await utils.Database.addIndividualSails(records_to_add).catch(err => utils.Slack.post(JSON.stringify(err)));
    if (Object.keys(records_to_delete).length > 0) await utils.Database.addIndividualSails(records_to_delete).catch(err => utils.Slack.post(JSON.stringify(err)));
}

async function main() {
    await utils.Database.updateCalendar().catch(err => utils.Slack.post(JSON.stringify(err)));
    await syncCapacity();
    await syncBoatSails();
    await syncIndividualSails();
}

exports.main = main;