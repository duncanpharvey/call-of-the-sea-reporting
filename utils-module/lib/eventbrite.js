const axios = require('axios');

async function getEvents(checkPast) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/organizations/${process.env.eventbrite_organization_id}/events`,
        headers: {
            Authorization: `Bearer ${process.env.eventbrite_token}`
        },
        params: {
            status: 'live,started,ended,completed', // exclude draft and cancelled events
        }
    }

    if (!checkPast) {
        req.params.time_filter = 'current_future' // only future events
    }

    var events = [];
    var morePages = false;
    do {
        await axios(req).then((res) => {
            morePages = res.data.pagination.has_more_items;
            if (morePages) {
                req.params.continuation = res.data.pagination.continuation;
            }

            res.data.events.forEach((event) => {
                events.push(event.id);
            })
        });
    }
    while (morePages);

    return events;
}

async function getAttendees(eventId) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/events/${eventId}/attendees`,
        headers: {
            Authorization: `Bearer ${process.env.eventbrite_token}`
        }
    }

    var attendeeMap = {};
    var morePages = false;
    do {
        await axios(req).then((res) => {
            morePages = res.data.pagination.has_more_items;
            if (morePages) {
                req.params.continuation = res.data.pagination.continuation;
            }

            res.data.attendees.forEach((attendee) => {
                if (!attendee.cancelled) {
                    attendeeMap[attendee.id] = eventId;
                }
            })
        });
    }
    while (morePages);

    return attendeeMap;
}

module.exports = {
    getAttendees: getAttendees,
    getEvents: getEvents
};