const { Client } = require('pg');
const Airtable = require('airtable');

var base = new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id);

const client = new Client({
  connectionString: process.env.database_connection_string,
  ssl: { rejectUnauthorized: false }
});

async function getAirtableCapacity() {
  var capacity = {};

  await base('Capacity').select({
    fields: ['Id', 'Value']
  }).all()
    .then(records => {
      records.forEach(record => {
        capacity[record.get('Id')] = record.get('Value');
      })
    })
    .catch(e => console.error(e));

  return capacity;
}

async function getDbCapacity() {
  var capacity = {};

  await client.query(`select id, value from capacity;`)
    .then(res => {
      res.rows.forEach(record => {
        capacity[record.id] = record.value;
      });
    })
    .catch(e => console.error(e));

  return capacity;
}

async function getDbIndividualSails() {
  var sails = {};

  await client.query(`select airtable_id, total_cost from individual_sails;`)
    .then(res => {
      res.rows.forEach(record => {
        sails[record.airtable_id] = {
          totalCost: record.total_cost
        }
      });
    })
    .catch(e => console.error(e));

  return sails;
}

async function getAirtableIndividualSails() {
  var sails = {};

  await base('By Individual Sails').select({
    fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost']
  }).all()
    .then(records => {
      records.forEach(record => {
        sails[record.id] = {
          vesselConductingSail: record.get('VesselConductingSail'),
          boardingDate: record.get('BoardingDate'),
          boardingTime: record.get('BoardingTime'),
          disembarkingDate: record.get('DisembarkingDate'),
          disembarkingTime: record.get('DisembarkingTime'),
          status: record.get('Status'),
          totalCost: record.get('TotalCost')
        }
      });
    })
    .catch(e => console.error(e));

  return sails;
}

async function getDbBoatSails() {
  var sails = {};

  await client.query(`select airtable_id, total_cost, total_passengers from boat_sails;`)
    .then(res => {
      res.rows.forEach(record => {
        sails[record.airtable_id] = {
          totalCost: record.total_cost
        }
      });
    })
    .catch(e => console.error(e));

  return sails;
}

async function getAirtableBoatSails() {
  var sails = {};

  await base('By Boat Sails').select({
    fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'TotalPassengers']
  }).all()
    .then(records => {
      records.forEach(record => {
        sails[record.id] = {
          vesselConductingSail: record.get('VesselConductingSail'),
          boardingDate: record.get('BoardingDate'),
          boardingTime: record.get('BoardingTime'),
          disembarkingDate: record.get('DisembarkingDate'),
          disembarkingTime: record.get('DisembarkingTime'),
          status: record.get('Status'),
          totalCost: record.get('TotalCost'),
          totalPassengers: record.get('TotalPassengers')
        }
      });
    })
    .catch(e => console.error(e));

  return sails;
}

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

async function updateCalendar() {
  await client.query(`do $$
  declare
  check_date date := '2019-06-01';--(select max(date) from calendar) + INTERVAL '1 day';
  end_date date := current_date + INTERVAL '2 years';

  begin
  while check_date <= end_date loop
  insert into calendar(date) values(check_date);
  check_date := check_date + INTERVAL '1 day';
  end loop;
  end $$;`).catch(e => console.error(e.stack));
}

async function updateCapacity() {

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