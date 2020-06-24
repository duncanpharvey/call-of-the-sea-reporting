const { airtableDateFormat, base, moment, Slack } = require('../config.js');

async function get() {
    const sails = {};
    await base('By Boat Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'TotalPassengers']
    }).all().then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.get('VesselConductingSail');
            const status = record.get('Status');
            const totalCost = record.get('TotalCost');
            const totalPassengers = record.get('TotalPassengers');
            var boardingDateTime = null;
            try { boardingDateTime = moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { boardingDateTime = null; }
            var disembarkingDateTime;
            try { disembarkingDateTime = moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { disembarkingDateTime = null; }
            sails[record.id] = {
                vesselConductingSail: vesselConductingSail ? vesselConductingSail : null,
                boardingDateTime: boardingDateTime,
                disembarkingDateTime: disembarkingDateTime,
                status: status ? status : 'Scheduled',
                totalCost: totalCost ? totalCost : 0,
                totalPassengers: totalPassengers ? totalPassengers : 0
            }
        });
    }).catch(err => Slack.post(JSON.stringify(err)));
    return sails;
}

module.exports = {
    get: get
};