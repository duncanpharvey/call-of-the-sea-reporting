const { airtableDateFormat, moment, Slack } = require('../config.js');
const request = require('../request-handler.js');

async function get() {
    const sails = {};
    const fields = ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'ScholarshipAwarded', 'Paid', 'Outstanding'];
    await request.get('By Individual Sails', fields).then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.fields.VesselConductingSail;
            var boardingDateTime;
            try { boardingDateTime = moment(`${record.fields.BoardingDate} ${record.fields.BoardingTime}`, airtableDateFormat).format(dateFormat); }
            catch { boardingDateTime = null; }
            var disembarkingDateTime;
            try { disembarkingDateTime = moment(`${record.fields.DisembarkingDate} ${record.fields.DisembarkingTime}`, airtableDateFormat).format(dateFormat); }
            catch { disembarkingDateTime = null; }
            const status = record.fields.Status;
            const totalCost = record.fields.TotalCost;
            const scholarshipAwarded = record.fields.ScholarshipAwarded;
            const paid = record.fields.Paid;
            const outstanding = record.fields.Outstanding;
            sails[record.id] = {
                vessel_conducting_sail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
                boarding_date: boardingDateTime,
                disembarking_date: disembarkingDateTime,
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