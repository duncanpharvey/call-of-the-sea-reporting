const Airtable = require('airtable');

var base = new Airtable({apiKey: process.env.airtable_api_key}).base(process.env.airtable_base_id);

async function getAirtableRecords(fields) {

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
    
    return {sails: sails, idMap: idMap}
  }

  exports.getAirtableRecords = getAirtableRecords;