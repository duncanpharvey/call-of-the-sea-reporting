const moment = require('moment');

const Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.airtable_api_key }).base(process.env.airtable_base_id);

const date_format_airtable = 'YYYY-MM-DD hh:mm a';

async function getCapacity() {
    var capacity = {};
    await base('Capacity').select({
        fields: ['Id', 'Day', 'Value']
    }).all()
        .then(records => {
            records.forEach(record => {
                capacity[record.get('Id')] = {
                    day: record.get('Day').toLowerCase(),
                    value: record.get('Value')
                };
            })
        });
    return capacity;
}

async function getBoatSails() {
    var sails = {};
    await base('By Boat Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'TotalPassengers']
    }).all()
        .then(records => {
            records.forEach(record => {
                sails[record.id] = {
                    vesselConductingSail: record.get('VesselConductingSail'),
                    boardingDateTime: moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, date_format_airtable).format(date_format),
                    disembarkingDateTime: moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, date_format_airtable).format(date_format),
                    status: record.get('Status'),
                    totalCost: record.get('TotalCost'),
                    totalPassengers: record.get('TotalPassengers')
                }
            });
        });
    return sails;
}

async function getIndividualSails() {
    var sails = {};
    await base('By Individual Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost']
    }).all()
        .then(records => {
            records.forEach(record => {
                sails[record.id] = {
                    vesselConductingSail: record.get('VesselConductingSail'),
                    boardingDateTime: moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, date_format_airtable).format(date_format),
                    disembarkingDateTime: moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, date_format_airtable).format(date_format),
                    status: record.get('Status'),
                    totalCost: record.get('TotalCost')
                }
            });
        });
    return sails;
}

module.exports = {
    getCapacity: getCapacity,
    getBoatSails: getBoatSails,
    getIndividualSails: getIndividualSails
};
