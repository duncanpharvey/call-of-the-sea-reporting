const { airtableDateFormat, airtableTimeFormat, axios, eventbriteDateFormat, moment } = require('../config.js');

/* 
    Due to cancellations, these passengers were manually transferred to other sails and should not be cancelled.
    They will be prevented from being added to Airtable to avoid duplicate counting of revenue in reports
*/
const skip = [
    '1785261371',
    '1785261373',
    '1786142737',
    '1786142739',
    '1786282361',
    '1786282363'
];

async function get(event, attendeeDictionary) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/events/${event.id}/attendees`,
        headers: { Authorization: `Bearer ${process.env.eventbrite_token}` }
    }

    var attendees = [];
    var morePages = false;
    do {
        await axios(req).then((res) => {
            morePages = res.data.pagination.has_more_items;
            if (morePages) { req.params.continuation = res.data.pagination.continuation; }
            attendees = attendees.concat(res.data.attendees);
        });
    }
    while (morePages);

    attendees.forEach(attendee => {
        if (skip.includes(attendee.id)) { return; }
        const status = attendee.status;
        var eventbriteStatus;
        if (status == 'Deleted') { eventbriteStatus = 'Deleted' }
        else if (attendee.cancelled) { eventbriteStatus = 'Cancelled' }
        else { eventbriteStatus = status }
        const email = attendee.profile.email;
        const dayPhone = attendee.profile.cell_phone;
        const eventTitle = event.name.text;
        const participantName = attendee.profile.name;
        const orderId = attendee.order_id;
        const eventId = attendee.event_id;
        const vesselConductingSail = "Matthew Turner"; // todo: create regex to look for vessel name in event title
        const boardingDateTime = moment(event.start.local, eventbriteDateFormat);
        const disembarkingDateTime = moment(event.end.local, eventbriteDateFormat);;
        const totalCost = attendee.costs.base_price.major_value;
        const paid = attendee.costs.base_price.major_value;
        const qtyTickets = attendee.ticket_class_name;
        const capacity = event.capacity;
        attendeeDictionary[attendee.id] = {
            Status: eventbriteStatus == 'Deleted' || eventbriteStatus == 'Cancelled' ? 'Cancelled' : 'Booked',
            EventbriteStatus: eventbriteStatus ? eventbriteStatus : 'Booked',
            Email: email ? email : null,
            DayPhone: dayPhone ? dayPhone : null,
            EventTitle: eventTitle ? eventTitle : null,
            ParticipantName: participantName ? participantName : null,
            EventbriteOrderId: orderId ? orderId : null,
            EventbriteEventId: eventId ? eventId : null,
            VesselConductingSail: vesselConductingSail ? vesselConductingSail : null,
            BoardingDate: boardingDateTime.isValid() ? boardingDateTime.format(airtableDateFormat) : null,
            BoardingTime: boardingDateTime.isValid() ? boardingDateTime.format(airtableTimeFormat) : null,
            DisembarkingDate: disembarkingDateTime.isValid() ? disembarkingDateTime.format(airtableDateFormat) : null,
            DisembarkingTime: disembarkingDateTime.isValid() ? disembarkingDateTime.format(airtableTimeFormat) : null,
            TotalCost: totalCost ? parseInt(totalCost) : 0,
            Paid: paid ? parseInt(paid) : 0,
            QtyTickets: qtyTickets ? qtyTickets : 'General Admission',
            ContactName: participantName ? participantName : null,
            PassengerCapacityOverride: capacity ? capacity : null
        }
    });

    return attendeeDictionary;
}

module.exports = {
    get: get
};