const { airtableDateFormat, moment, Slack } = require('../config.js');
const request = require('../request-handler.js');

async function get() {
    const sails = {};
    const fields = ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'ScholarshipAwarded', 'Paid', 'Outstanding'];
    await request.get('By Individual Sails', fields).then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.fields.VesselConductingSail;
            const boardingDateTime = moment(`${record.fields.BoardingDate} ${record.fields.BoardingTime}`, airtableDateFormat);
            const disembarkingDateTime = moment(`${record.fields.DisembarkingDate} ${record.fields.DisembarkingTime}`, airtableDateFormat);
            const status = record.fields.Status;
            const totalCost = record.fields.TotalCost;
            const scholarshipAwarded = record.fields.ScholarshipAwarded;
            const paid = record.fields.Paid;
            const outstanding = record.fields.Outstanding;
            sails[record.id] = {
                vessel_conducting_sail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
                boarding_date: boardingDateTime.isValid() ? boardingDateTime.format(dateFormat) : null,
                disembarking_date: disembarkingDateTime.isValid() ? disembarkingDateTime.format(dateFormat) : null,
                status: status ? status.toLowerCase() : 'scheduled',
                total_cost: totalCost ? totalCost : 0,
                scholarship_awarded: scholarshipAwarded ? scholarshipAwarded : 0,
                paid: paid ? paid : 0,
                outstanding: outstanding ? outstanding : 0
            }
        });
    }).catch(err => Slack.post(err));
    return sails;
}

module.exports = {
    get: get
};