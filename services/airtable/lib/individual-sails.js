const { airtableDateTimeFormat, moment, Slack } = require('../config.js');
const request = require('../request-handler.js');

async function get() {
    const sails = {};
    const fields = ['VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'Status', 'TotalCost', 'ScholarshipAwarded', 'Paid', 'Outstanding'];
    await request.get('By Individual Sails', fields).then(records => {
        records.forEach(record => {
            const vesselConductingSail = record.fields.VesselConductingSail;
            const boardingDateTime = moment(`${record.fields.BoardingDate} ${record.fields.BoardingTime}`, airtableDateTimeFormat);
            const disembarkingDateTime = moment(`${record.fields.DisembarkingDate} ${record.fields.DisembarkingTime}`, airtableDateTimeFormat);
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
    const fields = ['Status', 'EventbriteStatus', 'Email', 'DayPhone', 'EventTitle', 'ParticipantName', 'EventbriteAttendeeId', 'EventbriteOrderId', 'EventbriteEventId', 'VesselConductingSail', 'BoardingDate', 'BoardingTime', 'DisembarkingDate', 'DisembarkingTime', 'TotalCost', 'Paid', 'QtyTickets', 'ContactName', 'PassengerCapacityOverride'];
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
            const BoardingDate = record.fields.BoardingDate;
            const BoardingTime = record.fields.BoardingTime;
            const DisembarkingDate = record.fields.DisembarkingDate;
            const DisembarkingTime = record.fields.DisembarkingTime;
            const totalCost = record.fields.TotalCost;
            const paid = record.fields.Paid;
            const qtyTickets = record.fields.QtyTickets;
            const contactName = record.fields.ContactName;
            const passengerCapacityOverride = record.fields.PassengerCapacityOverride
            // fields named to match Airtable since object is used to directly update Airtable fields
            sails[record.fields.EventbriteAttendeeId] = {
                Status: status ? status : null,
                EventbriteStatus: eventbriteStatus ? eventbriteStatus : null,
                Email: email ? email : null,
                DayPhone: dayPhone ? dayPhone : null,
                EventTitle: eventTitle ? eventTitle : null,
                ParticipantName: participantName ? participantName : null,
                EventbriteOrderId: orderId ? orderId : null,
                EventbriteEventId: eventId ? eventId : null,
                VesselConductingSail: vesselConductingSail ? vesselConductingSail : null,
                BoardingDate: BoardingDate ? BoardingDate : null,
                BoardingTime: BoardingTime ? BoardingTime : null,
                DisembarkingDate: DisembarkingDate ? DisembarkingDate : null,
                DisembarkingTime: DisembarkingTime ? DisembarkingTime : null,
                TotalCost: Number.isInteger(totalCost) ? totalCost : null,
                Paid: Number.isInteger(paid) ? paid : null,
                QtyTickets: qtyTickets ? qtyTickets : null,
                ContactName: contactName ? contactName : contactName,
                PassengerCapacityOverride: passengerCapacityOverride ? passengerCapacityOverride : null
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
    if (addRequest.length > 0) { request.add('By Individual Sails', addRequest).then(Slack.post(`adding attendees: ${JSON.stringify(addRequest)}`, process.env.slack_airtable_webhook_url)).catch(err => Slack.post(err, process.env.slack_airtable_webhook_url)); }
}

async function update(records, map) {
    var updateRequest = [];
    const updateableStatuses = ['Booked', 'Cancelled'];
    for (const id of Object.keys(records)) {
        const record = records[id];
        const airtableRecord = map[id];
        const sail = {
            id: airtableRecord.airtable_id,
            fields: {}
        };
        for (const field of Object.keys(record)) {
            var value = record[field];

            // don't change paid field since it is manually set after the initial add
            if (field == 'Paid') { continue; }

            // don't change status if other than booked or cancelled since it was manually set
            if (field == 'Status' && value != 'Cancelled' && !updateableStatuses.includes(airtableRecord.status)) { continue; }

            // cancel regardless of status if cancelled in Eventbrite
            else if (field == 'Status' && value == 'Cancelled') {
                sail.fields['CancellationReason'] = 'Cancelled in Eventbrite, Airtable record updated via script';
            }

            // only set status if the existing status was set by integration to avoid overwriting manually set statuses in Airtable
            else if (field == 'Status' && value != 'Cancelled' && (!airtableRecord.status || updateableStatuses.includes(airtableRecord.status))) {
                sail.fields['CancellationReason'] = null;
            }

            sail.fields[field] = value;
        }

        if (Object.keys(sail.fields).length > 0) {
            updateRequest.push(sail);
        }
    }
    if (updateRequest.length > 0) { Slack.post(`updating attendees report: ${JSON.stringify(updateRequest)}`, process.env.slack_airtable_webhook_url); }
    // if (updateRequest.length > 0) request.update('By Individual Sails', updateRequest).then(Slack.post(`updating attendees: ${JSON.stringify(updateRequest)}`, process.env.slack_airtable_webhook_url)).catch(err => Slack.post(err, process.env.slack_airtable_webhook_url));

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
    if (cancelRequest.length > 0) { Slack.post(`cancel attendees report: ${JSON.stringify(cancelRequest)}`, process.env.slack_airtable_webhook_url); }
    // if (cancelRequest.length > 0) request.update('By Individual Sails', cancelRequest).then(Slack.post(`cancelling attendees: ${JSON.stringify(cancelRequest)}`, process.env.slack_airtable_webhook_url)).catch(err => Slack.post(err, process.env.slack_airtable_webhook_url));
}

// function used during cleanup on 9/3/2020 - 9/4/2020
/*
function report(airtableAttendees, eventbriteAttendees, map, recordsToUpdate, recordsToAdd) {
    const skip = [];
    for (const id of recordsToUpdate) {
        if (skip.includes(map[id].airtable_id)) { continue; }
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

        console.log(line);
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
*/

module.exports = {
    add: add,
    cancel: cancel,
    get: get,
    getEventbrite: getEventbrite,
    update: update
};