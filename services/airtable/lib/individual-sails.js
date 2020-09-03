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

async function getEventbrite(date) {
    const sails = {};
    const fields = ['EventbriteStatus', 'Email', 'DayPhone', 'EventTitle', 'ParticipantName', 'EventbriteAttendeeId', 'EventbriteOrderId', 'EventbriteEventId', 'VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'TotalCost', 'Paid'];
    const formula = "NOT({EventbriteAttendeeId} = '')";
    await request.get('By Individual Sails', fields, formula).then(records => {
        records.forEach(record => {
            const eventbriteStatus = record.fields.EventbriteStatus;
            const email = record.fields.Email;
            const dayPhone = record.fields.DayPhone;
            const eventTitle = record.fields.EventTitle;
            const participantName = record.fields.ParticipantName;
            const orderId = record.fields.EventbriteOrderId;
            const eventId = record.fields.EventbriteEventId;
            const vesselConductingSail = record.fields.VesselConductingSail;
            const boardingDateTime = moment(`${record.fields.BoardingDate} ${record.fields.BoardingTime}`, airtableDateFormat);
            const disembarkingDateTime = moment(`${record.fields.DisembarkingDate} ${record.fields.DisembarkingTime}`, airtableDateFormat);
            const totalCost = record.fields.TotalCost;
            const paid = record.fields.Paid;
            sails[record.fields.EventbriteAttendeeId] = {
                eventbrite_status: eventbriteStatus ? eventbriteStatus.toLowerCase() : 'scheduled',
                email: email ? email : null,
                dayphone: dayPhone ? dayPhone : null,
                event_title: eventTitle ? eventTitle : null,
                participant_name: participantName ? participantName : null,
                order_id: orderId ? orderId : null,
                event_id: eventId ? eventId : null,
                vessel_conducting_sail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
                boarding_date: boardingDateTime.isValid() ? boardingDateTime.format(dateFormat) : null,
                disembarking_date: disembarkingDateTime.isValid() ? disembarkingDateTime.format(dateFormat) : null,
                total_cost: totalCost ? totalCost : 0,
                paid: paid ? paid : 0
            }
        });
    }).catch(err => Slack.post(err));
    return sails;
}

module.exports = {
    get: get,
    getEventbrite: getEventbrite
};