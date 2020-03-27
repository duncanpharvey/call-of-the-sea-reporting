const Airtable = require('airtable');

var base = new Airtable({apiKey: process.env.airtable_api_key}).base(process.env.airtable_base_id);

Set.prototype.difference = function(otherSet) { 
  var differenceSet = new Set();
  for(var elem of this) 
  { 
    if(!otherSet.has(elem)) 
      differenceSet.add(elem); 
  }
  return differenceSet; 
}

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
          console.log('multiple by boat sails in one reporting record: ' + record.get('ID'));
        }
        byBoatSails.forEach((sailId)=> {
          if (reportingSet.has(sailId)) {
            console.log('duplicate by boat sail: ' + sailId);
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
      console.log('in reporting, not in boat ');
      console.log(notInBoat);
    }

    if (notInReporting.size > 0) {
      console.log('in boat, not in reporting ');
      console.log(notInReporting);
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
            console.log('duplicate by individual sail: ' + sailId);
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
      console.log('in reporting, not in individual ');
      console.log(notInIndividual);
    }

    if (notInReporting.size > 0) {
      console.log('in individual, not in reporting ');
      console.log(notInReporting);
    }
  }

  exports.getReportingRecords = getReportingRecords;
  exports.boatSailsLinked = boatSailsLinked;
  exports.individualSailsLinked = individualSailsLinked;