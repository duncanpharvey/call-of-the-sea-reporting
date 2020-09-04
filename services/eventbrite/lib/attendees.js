const { axios, eventbriteDateFormat, moment } = require('../config.js');

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
        const totalCost = attendee.costs.gross.major_value;
        const paid = attendee.costs.gross.major_value; // todo: figure out if should set conditionally based on payment type
        attendeeDictionary[attendee.id] = {
            Status: eventbriteStatus == 'Deleted' || eventbriteStatus == 'Cancelled' ? 'Cancelled' : 'Booked',
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
            // TotalCost: totalCost ? parseInt(totalCost) : 0,
            // Paid: paid ? parseInt(paid) : 0
            // Quantity of tickets
        }
    });

    return attendeeDictionary;
}

module.exports = {
    get: get
};