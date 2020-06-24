async function updateDatabase() {
  var db_boat_sails = await getDbBoatSails();
  var airtable_boat_sails = await getAirtableBoatSails();

  var db_boat_sails_set = new Set(Object.keys(db_boat_sails));
  var airtable_boat_sails_set = new Set(Object.keys(airtable_boat_sails));

  for (airtable_id of airtable_boat_sails_set.difference(db_boat_sails_set)) {
    if (airtable_id.length != 17 || airtable_id.slice(0, 3) != 'rec') {
      console.error('invalid airtable id');
      continue;
    }
    var sail = airtable_boat_sails[airtable_id];
    await client.query(`insert into boat_sails (airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost, total_passengers) values ('${airtable_id}', '${sail.vesselConductingSail}', date '${sail.boardingDate}'  + time '${sail.boardingTime}', date '${sail.disembarkingDate}'  + time '${sail.disembarkingTime}', '${sail.status}', '${sail.totalCost}', '${sail.totalPassengers}');`)
      .catch(e => console.error(e));
  }

  await client.query(`delete from boat_sails where airtable_id in ('${Array.from(db_boat_sails_set.difference(airtable_boat_sails_set)).join("','")}')`)
    .catch(e => console.error(e));

  
  var db_individual_sails = await getDbIndividualSails();
  var airtable_individual_sails = await getAirtableIndividualSails();

  var db_individual_sails_set = new Set(Object.keys(db_individual_sails));
  var airtable_individual_sails_set = new Set(Object.keys(airtable_individual_sails));

  for (airtable_id of airtable_individual_sails_set.difference(db_individual_sails_set)) {
    if (airtable_id.length != 17 || airtable_id.slice(0, 3) != 'rec') {
      console.error('invalid airtable id');
      continue;
    }
    var sail = airtable_individual_sails[airtable_id];
    await client.query(`insert into individual_sails (airtable_id, vessel_conducting_sail, boarding_date, disembarking_date, status, total_cost) values ('${airtable_id}', '${sail.vesselConductingSail}', date '${sail.boardingDate}'  + time '${sail.boardingTime}', date '${sail.disembarkingDate}'  + time '${sail.disembarkingTime}', '${sail.status}', '${sail.totalCost}');`)
      .catch(e => console.error(e));
  }

  await client.query(`delete from individual_sails where airtable_id in ('${Array.from(db_individual_sails_set.difference(airtable_individual_sails_set)).join("','")}')`)
    .catch(e => console.error(e));
  
}

async function testing() {
  await client.connect().then(() => { console.log("connected!") });
  //var capacity = await getCapacity();
  await updateCalendar();
  await updateDatabase();
  await client.end();
}

Set.prototype.difference = function (otherSet) {
  var differenceSet = new Set();
  for (var elem of this) {
    if (!otherSet.has(elem))
      differenceSet.add(elem);
  }
  return differenceSet;
}

testing();

// add created, lastmodified dates