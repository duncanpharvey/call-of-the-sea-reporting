const { airtableDateFormat, base, moment, Slack } = require('../config.js');

// todo: set record order for airtable, eventbrite, and db api

async function get() {
    const sails = {};
    await base('By Individual Sails').select({
        fields: ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'ScholarshipAwarded', 'Paid', 'Outstanding']
    }).all().then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.get('VesselConductingSail');
            const status = record.get('Status');
            const totalCost = record.get('TotalCost');
            const scholarshipAwarded = record.get('ScholarshipAwarded');
            const paid = record.get('Paid');
            const outstanding = record.get('Outstanding');
            var boardingDateTime = null;
            try { boardingDateTime = moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { boardingDateTime = null; }
            var disembarkingDateTime;
            try { disembarkingDateTime = moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { disembarkingDateTime = null; }
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

async function get2() {
    const sails = [];
    await base('By Individual Sails').select({
        fields: ['VesselConductingSail', 'Email', 'EventTitle', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'TotalCost', 'ParticipantName', 'EventbriteAttendeeId', 'EventbriteOrderId', 'EventbriteEventId', 'Status']
    }).all().then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.get('VesselConductingSail');
            const email = record.get('Email');
            const eventTitle = record.get('EventTitle');
            const participantName = record.get('ParticipantName');
            const eventbriteAttendeeId = record.get('EventbriteAttendeeId');
            const eventbriteOrderId = record.get('EventbriteOrderId');
            const eventbriteEventId = record.get('EventbriteEventId');
            const status = record.get('Status');
            const totalCost = record.get('TotalCost');
            var boardingDateTime = null;
            try { boardingDateTime = moment(`${record.get('BoardingDate')} ${record.get('BoardingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { boardingDateTime = null; }
            var disembarkingDateTime;
            try { disembarkingDateTime = moment(`${record.get('DisembarkingDate')} ${record.get('DisembarkingTime')}`, airtableDateFormat).format(dateFormat); }
            catch { disembarkingDateTime = null; }
            sails.push({
                id = record.id,
                vessel_conducting_sail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
                email: email ? email : null,
                event_title: eventTitle ? eventTitle : null,
                participant_name: participantName ? participantName : null,
                eventbrite_attendee_id: eventbriteAttendeeId ? eventbriteAttendeeId : null,
                eventbrite_order_id: eventbriteOrderId ? eventbriteOrderId : null,
                eventbrite_event_id: eventbriteEventId ? eventbriteEventId : null,
                boarding_date: boardingDateTime,
                disembarking_date: disembarkingDateTime,
                status: status ? status.toLowerCase() : 'scheduled',
                total_cost: totalCost ? totalCost : 0
            });
        });
    }).catch(err => Slack.post(err));
    return sails;
}

module.exports = {
    get: get,
    get2: get2
};