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
            email: email ? email : null,
            dayphone: dayPhone ? dayPhone : null,
            event_title: eventTitle ? eventTitle : null,
            participant_name: participantName ? participantName : null,
            order_id: orderId ? orderId : null,
            event_id: eventId ? eventId : null,
            vessel_conducting_sail: vesselConductingSail ? vesselConductingSail.toLowerCase() : null,
            boarding_date: boardingDateTime.isValid() ? boardingDateTime.format(dateFormat) : null,
            disembarking_date: disembarkingDateTime.isValid() ? disembarkingDateTime.format(dateFormat) : null,
            total_cost: totalCost ? parseInt(totalCost) : 0,
            paid: paid ? parseInt(paid) : 0
        }
    });

    return attendeeDictionary;
}

module.exports = {
    get: get
};