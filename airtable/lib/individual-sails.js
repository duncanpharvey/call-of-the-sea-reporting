const { airtableDateFormat, base, moment, Slack } = require('../config.js');

async function get() {
    var sails = {};
    await base('By Individual Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost']
    }).all().then(records => {
        records.forEach(record => {
            sails[record.id] = {
                vesselConductingSail: record.get('VesselConductingSail'),
                boardingDateTime: moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat),
                disembarkingDateTime: moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat),
                status: record.get('Status'),
                totalCost: record.get('TotalCost')
            }
        });
    }).catch(err => Slack.post(JSON.stringify(err)));
    return sails;
}

module.exports = {
    get: get
};