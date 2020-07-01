const { Airtable, Database} = require('../../services');
const { addedDiff, deletedDiff, updatedDiff } = require('deep-object-diff');

async function syncCapacity() {
    const dbCapacity = await Database.Capacity.get();
    console.log('db capacity' + JSON.stringify(dbCapacity));
    const airtableCapacity = await Airtable.Capacity.get();
    console.log('airtable capacity' + JSON.stringify(airtableCapacity));

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

    const recordsToAdd = addedDiff(dbSails, airtableSails);
    const recordsToUpdate = updatedDiff(dbSails, airtableSails);
    const recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.BoatSails.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.BoatSails.update(recordsToUpdate);
    if (Object.keys(recordsToRemove).length > 0) await Database.BoatSails.remove(recordsToRemove);
}

async function syncIndividualSails() {
    const dbSails = await Database.IndividualSails.get();
    const airtableSails = await Airtable.IndividualSails.get();

    const recordsToAdd = addedDiff(dbSails, airtableSails);
    const recordsToUpdate = updatedDiff(dbSails, airtableSails);
    const recordsToRemove = Object.keys(deletedDiff(dbSails, airtableSails));
    
    if (Object.keys(recordsToAdd).length > 0) await Database.IndividualSails.add(recordsToAdd);
    if (Object.keys(recordsToUpdate).length > 0) await Database.IndividualSails.update(recordsToUpdate);
    if (Object.keys(recordsToRemove).length > 0) await Database.IndividualSails.remove(recordsToRemove);
}

async function main() {
    await Database.Calendar.update();
    await syncCapacity();
    await syncBoatSails();
    await syncIndividualSails();
}

exports.main = main;