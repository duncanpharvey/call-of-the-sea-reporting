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
    const map = {};
    const fields = ['Status', 'EventbriteStatus', 'Email', 'DayPhone', 'EventTitle', 'ParticipantName', 'EventbriteAttendeeId', 'EventbriteOrderId', 'EventbriteEventId', 'VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'TotalCost', 'Paid'];
    const formula = "NOT({EventbriteAttendeeId} = '')";
    await request.get('By Individual Sails', fields, formula).then(records => {
        records.forEach(record => {
            const airtableId = record.id;
            const status = record.fields.Status;
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
            // fields named to match Airtable since object is used to directly update Airtable fields
            sails[record.fields.EventbriteAttendeeId] = {
                Status: status == 'Cancelled' ? 'Cancelled' : 'Booked',
                // EventbriteStatus: eventbriteStatus ? eventbriteStatus : 'Booked',
                Email: email ? email : null,
                DayPhone: dayPhone ? dayPhone : null,
                EventTitle: eventTitle ? eventTitle : null,
                ParticipantName: participantName ? participantName : null,
                EventbriteOrderId: orderId ? orderId : null,
                EventbriteEventId: eventId ? eventId : null,
                // VesselConductingSail: vesselConductingSail ? vesselConductingSail : null,
                BoardingDate: boardingDateTime.isValid() ? boardingDateTime.format(dateFormat) : null,
                DisembarkingDate: disembarkingDateTime.isValid() ? disembarkingDateTime.format(dateFormat) : null,
                // TotalCost: totalCost ? totalCost : 0,
                // Paid: paid ? paid : 0
            }
            map[record.fields.EventbriteAttendeeId] = {
                airtable_id: airtableId,
                status: status
            };
        });
    }).catch(err => Slack.post(err));
    return [sails, map];
}

async function add(records) {
    var addRequest = [];
    for (const id of Object.keys(records)) {
        const record = records[id];
        const sail = {
            fields: {
                EventbriteAttendeeId: id
            }
        };
        for (const field of Object.keys(record)) {
            var value = record[field];
            if (field == 'Status' && value == 'Cancelled') {
                sail.fields['CancellationReason'] = 'Cancelled in Eventbrite, Airtable record updated via script';
            }
            sail.fields[field] = value;
        }
        addRequest.push(sail);
    }
    // console.log(addRequest);
    // request.add('By Individual Sails', addRequest).catch(err => Slack.post(err));
}

async function update(records, map) {
    var updateRequest = [];
    for (const id of Object.keys(records)) {
        const record = records[id];
        const sail = {
            id: map[id].airtable_id,
            fields: {}
        };
        for (const field of Object.keys(record)) {
            var value = record[field];
            if (field == 'Status' && value == 'Cancelled') {
                sail.fields['CancellationReason'] = 'Cancelled in Eventbrite, Airtable record updated via script';
            }
            else if (field == 'Status' && value != 'Cancelled') {
                sail.fields['CancellationReason'] = null;
            }
            sail.fields[field] = value;
        }
        updateRequest.push(sail);
    }
    // console.log(updateRequest);
    // request.update('By Individual Sails', updateRequest).catch(err => Slack.post(err));
}

async function cancel(records, map) {
    var cancelRequest = [];
    for (const id of records) {
        const record = map[id];
        if (record.status == 'Cancelled') { continue; }
        const sail = {
            id: record.airtable_id,
            fields: {
                CancellationReason: 'Unable to locate in Eventbrite, Airtable record updated via script',
                EventbriteStatus: 'Unable to locate in Eventbrite',
                Status: 'Cancelled'
            }
        };
        cancelRequest.push(sail);
    }
    console.log(cancelRequest);
    // request.update('By Individual Sails', cancelRequest).catch(err => Slack.post(err));
}

function report(airtableAttendees, eventbriteAttendees, map, recordsToUpdate, recordsToAdd) {
    for (const id of recordsToUpdate) {
        var line = map[id].airtable_id;
        const airtableRecord = airtableAttendees[id];
        for (const field of Object.keys(airtableRecord)) {
            line += ';' + airtableRecord[field];
        }

        line += ';;' + id;
        const eventbriteRecord = eventbriteAttendees[id];
        for (const field of Object.keys(eventbriteRecord)) {
            line += ';' + eventbriteRecord[field];
        }

        // console.log(line);
    }

    for (const id of recordsToAdd) {
        var line = id;
        const eventbriteRecord = eventbriteAttendees[id];
        for (const field of Object.keys(eventbriteRecord)) {
            line += ';' + eventbriteRecord[field];
        }

        console.log(line);
    }
}

module.exports = {
    add: add,
    cancel: cancel,
    get: get,
    getEventbrite: getEventbrite,
    report: report,
    update: update
};