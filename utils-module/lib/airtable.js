const Airtable = require('airtable');
const slack = require('./slack');
require('./helper').difference(Set);

var base = new Airtable({apiKey: process.env.airtable_api_key}).base(process.env.airtable_base_id);

async function getReportingRecords(fields) {
  var sails = await base('Reporting').select({
    fields: fields,
    filterByFormula: "OR(NOT({ByBoatSails} = ''), NOT({ByIndividualSails} = ''))",
    sort: [{field: "ID", direction: "asc"}]
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
  
  return {sails: sails, idMap: idMap};
}

  async function boatSailsLinked() {
    var reportingSet = new Set();
    await base('Reporting').select({
      fields: ['ID', 'ByBoatSails'],
      filterByFormula: "NOT({ByBoatSails} = '')"
    }).all().then((records) => {
      records.forEach((record) => {
        byBoatSails = record.get('ByBoatSails');
        if (byBoatSails.length > 1) {
          slack.post('multiple by boat sails in one reporting record: ' + record.get('ID'));
        }
        byBoatSails.forEach((sailId)=> {
          if (reportingSet.has(sailId)) {
            slack.post('duplicate by boat sail: ' + sailId);
          }
          reportingSet.add(sailId);
        })
      });
    });

    var boatsSet = new Set();
    await base('By Boat Sails').select({
      fields: ['Status'],
      filterByFormula: "NOT({Status} = 'Cancelled')"
    }).all().then((records) => {
      records.forEach((sail) => {
        boatsSet.add(sail.id)
      });
    });

    var notInBoat = reportingSet.difference(boatsSet);
    var notInReporting = boatsSet.difference(reportingSet);

    if (notInBoat.size > 0) {
      var string = '';
      notInBoat.forEach(value => string += value + ' ')
      slack.post('in reporting, not in boat: ' + string);
    }

    if (notInReporting.size > 0) {
      var string = '';
      notInReporting.forEach(value => string += value + ' ')
      slack.post('in boat, not in reporting: ' + string);
    }
  }

  async function individualSailsLinked() {
    var reportingSet = new Set();
    await base('Reporting').select({
      fields: ['ID', 'ByIndividualSails'],
      filterByFormula: "NOT({ByIndividualSails} = '')"
    }).all().then((records) => {
      records.forEach((record) => {
        byIndividualSails = record.get('ByIndividualSails');
        byIndividualSails.forEach((sailId)=> {
          if (reportingSet.has(sailId)) {
            slack.post('duplicate by individual sail: ' + sailId);
          }
          reportingSet.add(sailId);
        })
      });
    });

    var individualSet = new Set();
    await base('By Individual Sails').select({
      fields: ['Status'],
      filterByFormula: "NOT({Status} = 'Cancelled')"
    }).all().then((records) => {
      records.forEach((sail) => {
        individualSet.add(sail.id)
      });
    });

    var notInIndividual = reportingSet.difference(individualSet);
    var notInReporting = individualSet.difference(reportingSet);

    if (notInIndividual.size > 0) {
      var string = '';
      notInIndividual.forEach(value => string += value + ' ')
      slack.post('in reporting, not in individual: ' + string);
    }

    if (notInReporting.size > 0) {
      var string = '';
      notInReporting.forEach(value => string += value + ' ')
      slack.post('in individual, not in reporting: ' + string);
    }
  }

  exports.getReportingRecords = getReportingRecords;
  exports.boatSailsLinked = boatSailsLinked;
  exports.individualSailsLinked = individualSailsLinked;