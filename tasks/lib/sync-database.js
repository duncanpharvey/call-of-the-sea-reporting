const Database = require('../../db');
const Airtable = require('../../airtable');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncCapacity() {
    var dbCapacity = await Database.Capacity.get();
    var airtableCapacity = await Airtable.Capacity.get();

    var recordsToAdd = addedDiff(dbCapacity, airtableCapacity);
    var recordsToUpdate = updatedDiff(dbCapacity, airtableCapacity);
    var recordsToRemove = Object.keys(deletedDiff(dbCapacity, airtableCapacity));

    if (Object.keys(recordsToAdd).length > 0) await Database.Capacity.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.Capacity.update(recordsToUpdate);
    if (recordsToRemove.length > 0) await Database.Capacity.remove(recordsToRemove);
}

async function syncBoatSails() {
    var dbSails = await Database.BoatSails.get();
    var airtableSails = await Airtable.BoatSails.get();

    var recordsToAdd = addedDiff(dbSails, airtableSails);
    var recordsToUpdate = updatedDiff(dbSails, airtableSails);
    var recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.BoatSails.add(recordsToAdd);
    if (Object.keys(recordsToRemove).length > 0) await Database.BoatSails.remove(recordsToRemove);
}

async function syncIndividualSails() {
    var dbSails = await Database.IndividualSails.get();
    var airtableSails = await Airtable.IndividualSails.get();

    var recordsToAdd = addedDiff(dbSails, airtableSails);
    var recordsToUpdate = updatedDiff(dbSails, airtableSails);
    var recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.IndividualSails.add(recordsToAdd);
    if (Object.keys(recordsToRemove).length > 0) await Database.IndividualSails.remove(recordsToRemove);
}

async function main() {
    await Database.Calendar.update();
    await syncCapacity();
    await syncBoatSails();
    await syncIndividualSails();
}

exports.main = main;