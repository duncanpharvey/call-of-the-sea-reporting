const Airtable = require('airtable');
const helper = require('./helper');

var base = new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id);

async function getReportingRecords(fields) {
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

  var sails = [];
  await base('Reporting').select({
    fields: fields,
    filterByFormula: "XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))",
    sort: [{ field: "ID", direction: "asc" }]
  }).all().then((records) => {
    records.forEach((record) => {
      sail = record['_rawJson']['fields'];

      byBoatSails = sail['ByBoatSails'];
      if (byBoatSails) {
        sail['ByBoatSails'] = byBoatSails.map(s => { return idMap[s]; });
      }

      byIndividualSails = sail['ByIndividualSails'];
      if (byIndividualSails) {
        sail['ByIndividualSails'] = byIndividualSails.map(s => { return idMap[s]; });
      }

      sails.push(sail);
    });
  });

  return sails;
}

async function getReportingDifference() {
  var reportingMap = {};
  var byBoatMap = {};
  var byIndividualMap = {};
  var add = [];

  var remove = await base('Reporting').select({
    fields: ['ID'],
    filterByFormula: "NOT(XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = '')))"
  }).all();

  remove = remove.map((record) => { return record.id; });

  await base('Reporting').select({
    fields: ['EventId', 'ByBoatSails', 'ByIndividualSails'],
    filterByFormula: "XOR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))"
  }).all().then((records) => {
    records.forEach((record) => {
      var eventId = record.get('EventId');
      var byBoatSails = record.get('ByBoatSails');
      var byIndividualSails = record.get('ByIndividualSails');
      if (byBoatSails) {
        reportingMap[eventId] = { 'id': record.id, 'records': byBoatSails };
      }
      else if (byIndividualSails) {
        reportingMap[eventId] = { 'id': record.id, 'records': byIndividualSails };
      }
    })
  });

  await base('By Boat Sails').select({
    fields: ['EventId'],
    filterByFormula: "AND(NOT({Status} = 'Cancelled'), NOT({EventId} = ''))"
  }).all().then((records) => {
    records.forEach((record) => {
      byBoatMap[record.get('EventId')] = [record.id];
    })
  });

  await base('By Individual Sails').select({
    fields: ['EventId'],
    filterByFormula: "AND(NOT({Status} = 'Cancelled'), NOT({EventId} = ''))"
  }).all().then((records) => {
    records.forEach((record) => {
      var eventId = record.get('EventId');
      var linkedRecords;
      if (eventId in byIndividualMap) {
        linkedRecords = byIndividualMap[eventId];
      }
      else {
        linkedRecords = [];
      }
      linkedRecords.push(record.id);
      byIndividualMap[eventId] = linkedRecords;
    })
  });

  for (var eventId of Object.keys(byBoatMap)) {
    var byBoatSails = byBoatMap[eventId]
    if ((eventId in reportingMap) && helper.jsonEqual(byBoatSails, reportingMap[eventId].records)) {
      delete reportingMap[eventId];
    }
    else {
      add.push({ 'fields': { 'EventId': eventId, 'ByBoatSails': byBoatSails } });
    }
  }

  for (var eventId of Object.keys(byIndividualMap)) {
    var byIndividualSails = byIndividualMap[eventId].sort();
    if ((eventId in reportingMap) && helper.jsonEqual(byIndividualSails, reportingMap[eventId].records.sort())) {
      delete reportingMap[eventId];
    }
    else {
      add.push({ 'fields': { 'EventId': eventId, 'ByIndividualSails': byIndividualSails } });
    }
  }

  remove.push(...Object.keys(reportingMap).map((eventId) => { return reportingMap[eventId].id; }));

  return { add: add, remove: remove };
}


async function addReportingRecords(records) {
  var i, n, tempArr, chunk = 10;
  for (i = 0, n = records.length; i < n; i += chunk) {
    tempArr = records.slice(i, i + chunk);
    base('Reporting').create(tempArr);
  }
}

async function deleteReportingRecords(records) {
  var i, n, tempArr, chunk = 10;
  for (i = 0, n = records.length; i < n; i += chunk) {
    tempArr = records.slice(i, i + chunk);
    base('Reporting').destroy(tempArr);
  }
}

async function getDuplicateEventIds() {
  var boatEventIds = new Set();
  var indivEventIds;
  var duplicates = new Set();

  await base('By Boat Sails').select({
    fields: ['EventId'],
    filterByFormula: "AND(NOT({Status} = 'Cancelled'), NOT({EventId} = ''))"
  }).all().then((records) => {
    records.forEach((record) => {
      var eventId = record.get('EventId');
      if (boatEventIds.has(eventId)) {
        duplicates.add(eventId);
      }
      else {
        boatEventIds.add(eventId);
      }
    })
  });

  await base('By Individual Sails').select({
    fields: ['EventId'],
    filterByFormula: "AND(NOT({Status} = 'Cancelled'), NOT({EventId} = ''))"
  }).all().then((records) => {
    indivEventIds = new Set(records.map(record => record.get('EventId')));
  });

  return Array.from(duplicates.union(boatEventIds.intersection(indivEventIds)));
}

module.exports = {
  getReportingRecords: getReportingRecords,
  getReportingDifference: getReportingDifference,
  addReportingRecords: addReportingRecords,
  deleteReportingRecords: deleteReportingRecords,
  getDuplicateEventIds: getDuplicateEventIds
};