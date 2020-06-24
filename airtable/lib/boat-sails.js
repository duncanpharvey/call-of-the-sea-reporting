const { airtableDateFormat, base, moment, Slak } = require('../config.js');

async function get() {
    var sails = {};
    await base('By Boat Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'TotalPassengers']
    }).all().then(records => {
        records.forEach(record => {
            sails[record.id] = {
                vesselConductingSail: record.get('VesselConductingSail'),
                boardingDateTime: moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat),
                disembarkingDateTime: moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat),
                status: record.get('Status'),
                totalCost: record.get('TotalCost'),
                totalPassengers: record.get('TotalPassengers')
            }
        });
    }).catch(err => Slack.post(JSON.stringify(err)));
    return sails;
}

module.exports = {
    get: get
};