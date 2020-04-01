const Airtable = require('airtable');

var base = new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id);

async function getReportingRecords(fields) {
  var sails = await base('Reporting').select({
    fields: fields,
    filterByFormula: "OR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))",
    sort: [{ field: "ID", direction: "asc" }]
  }).all();

  var idMap = {};

  var boats = await base('By Boat Sails').select({
    fields: ['Sail_Id']
  }).all();
  boats.forEach((boat) => {
    idMap[boat.id] = boat.get('Sail_Id');
  });

  var participants = await base('By Individual Sails').select({
    fields: ['Participant_Id']
  }).all();
  participants.forEach((participant) => {
    idMap[participant.id] = participant.get('Participant_Id');
  });

  return { sails: sails, idMap: idMap };
}

async function getUnlinkedReportingRecords() {
  var records = await base('Reporting').select({
    fields: ['ID'],
    filterByFormula: "AND({ByBoatSails} = '', {ByIndividualSails} = '')"
  }).all();
  return records.map(record => { return record.id; });
}

async function getBoatLinkErrors() {
  var set = new Set();
  var duplicate = [];
  var multiple = [];
  await base('Reporting').select({
    fields: ['ID', 'ByBoatSails'],
    filterByFormula: "NOT({ByBoatSails} = '')"
  }).all().then((records) => {
    records.forEach((record) => {
      var byBoatSails = record.get('ByBoatSails');

      if (byBoatSails.length > 1) {
        multiple.push(...byBoatSails);
      }

      byBoatSails.forEach((sailId) => {
        if (set.has(sailId)) {
          duplicate.push(sailId);
        }
        set.add(sailId);
      });

    });
  });
  return { duplicate: duplicate, multiple: multiple };
}

async function getIndividualLinkErrors() {
  var set = new Set();
  var duplicate = [];
  await base('Reporting').select({
    fields: ['ID', 'ByIndividualSails'],
    filterByFormula: "NOT({ByIndividualSails} = '')"
  }).all().then((records) => {
    records.forEach((record) => {
      var byIndividualSails = record.get('ByIndividualSails');

      byIndividualSails.forEach((sailId) => {
        if (set.has(sailId)) {
          duplicate.push(sailId);
        }
        set.add(sailId);
      });

    });
  });
  return { duplicate: duplicate };
}

async function getEventIdLinkErrors() {
  var reportingMap = {}
  var sailMap = {}
  var missing = [];
  var badLink = [];

  await base('Reporting').select({
    fields: ['EventId', 'ByIndividualSails'],
    filterByFormula: "NOT({ByIndividualSails} = '')"
  }).all().then((records) => {
    records.forEach((record) => {
      var byIndividualSails = record.get('ByIndividualSails');
      byIndividualSails.forEach((sailId) => {
        reportingMap[sailId] = record.get('EventId');
      });
    });
  });

  await base('Reporting').select({
    fields: ['EventId', 'ByBoatSails'],
    filterByFormula: "NOT({ByBoatSails} = '')"
  }).all().then((records) => {
    records.forEach((record) => {
      var byBoatSails = record.get('ByBoatSails');
      byBoatSails.forEach((sailId) => {
        reportingMap[sailId] = record.get('EventId');
      });
    });
  });

  await base('By Individual Sails').select({
    fields: ['EventId'],
    filterByFormula: "NOT({Status} = 'Cancelled')"
  }).all().then((records) => {
    records.forEach((record) => {
      sailMap[record.id] = record.get('EventId');
    });
  });

  await base('By Boat Sails').select({
    fields: ['EventId'],
    filterByFormula: "NOT({Status} = 'Cancelled')"
  }).all().then((records) => {
    records.forEach((record) => {
      sailMap[record.id] = record.get('EventId');
    });
  });

  for (var id of Object.keys(sailMap)) {
    if (!(id in reportingMap)) {
      missing.push(id);
    }
    else if (sailMap[id] != reportingMap[id]) {
      badLink.push(id);
    }
  }

  return { missing: missing, badLink: badLink };
}

exports.getReportingRecords = getReportingRecords;
exports.getUnlinkedReportingRecords = getUnlinkedReportingRecords;
exports.getBoatLinkErrors = getBoatLinkErrors;
exports.getIndividualLinkErrors = getIndividualLinkErrors;
exports.getEventIdLinkErrors = getEventIdLinkErrors;