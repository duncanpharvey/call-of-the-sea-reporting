const Airtable = require('airtable');
const slack = require('./slack');

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

      byBoatSails.forEach((sail) => {
        if (set.has(sail)) {
          duplicate.push(sail);
        }
        set.add(sail);
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

      byIndividualSails.forEach((sail) => {
        if (set.has(sail)) {
          duplicate.push(sail);
        }
        set.add(sail);
      });

    });
  });
  return {duplicate: duplicate};
}

exports.getReportingRecords = getReportingRecords;
exports.getUnlinkedReportingRecords = getUnlinkedReportingRecords;
exports.getBoatLinkErrors = getBoatLinkErrors;
exports.getIndividualLinkErrors = getIndividualLinkErrors;