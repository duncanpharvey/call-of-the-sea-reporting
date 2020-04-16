const nock = require('nock');

function getEventsGeneric() {
    nock('https://www.eventbriteapi.com:443')
        .persist()
        .get(/events$/)
        .query(true)
        .reply(200, {
            "pagination": { "has_more_items": false },
            "events": []
        });
}

function getEvents(events) {
    nock('https://www.eventbriteapi.com:443')
        .get(`/v3/organizations/${process.env.eventbrite_organization_id}/events`)
        .query(new URLSearchParams({
            status: 'live,started,ended,completed',
            time_filter: 'current_future'
        }))
        .reply(200, {
            "pagination": { "has_more_items": false },
            "events": events
        });
}

function getAttendees(eventId, attendees) {
    nock('https://www.eventbriteapi.com:443')
        .get(`/v3/events/${eventId}/attendees`)
        .reply(200, {
            "pagination": { "has_more_items": false },
            "attendees": attendees
        });
}

module.exports = {
    getEventsGeneric: getEventsGeneric,
    getEvents: getEvents,
    getAttendees: getAttendees
};