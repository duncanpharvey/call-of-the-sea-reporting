const { airtableDateFormat, base, moment, Slack } = require('../config.js');

async function get() {
    const sails = {};
    await base('By Boat Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'ScholarshipAwarded', 'Paid', 'Outstanding', 'TotalPassengers', 'Students', 'Adults']
    }).all().then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.get('VesselConductingSail');
            const status = record.get('Status');
            const totalCost = record.get('TotalCost');
            const scholarshipAwarded = record.get('ScholarshipAwarded');
            const paid = record.get('Paid');
            const outstanding = record.get('Outstanding');
            const totalPassengers = record.get('TotalPassengers');
            const students = record.get('Students');
            const adults = record.get('Adults');
            var boardingDateTime = null;
            try { boardingDateTime = moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { boardingDateTime = null; }
            var disembarkingDateTime;
            try { disembarkingDateTime = moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { disembarkingDateTime = null; }
            sails[record.id] = {
                vesselConductingSail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
                boardingDateTime: boardingDateTime,
                disembarkingDateTime: disembarkingDateTime,
                status: status ? status.toLowerCase() : 'scheduled',
                totalCost: totalCost ? totalCost : 0,
                scholarshipAwarded: scholarshipAwarded ? scholarshipAwarded : 0,
                paid: paid ? paid : 0,
                outstanding: outstanding ? outstanding : 0,
                totalPassengers: totalPassengers ? totalPassengers : 0,
                students: students ? students : 0,
                adults: adults ? adults : 0
            }
        });
    }).catch(err => Slack.post(err));
    return sails;
}

module.exports = {
    get: get
};