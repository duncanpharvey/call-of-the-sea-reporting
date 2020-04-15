const nock = require('nock');

function getEvents() {
    nock('https://www.eventbriteapi.com:443')
        .persist()
        .get(/events$/)
        .query(true)
        .reply(200, {
            "pagination": {
                "object_count": 1,
                "page_number": 1,
                "page_size": 50,
                "page_count": 1,
                "has_more_items": false
            },
            "events": []
        });
}

function getAttendees() {
    nock('https://www.eventbriteapi.com:443')
        .persist()
        .get(/attendees$/)
        .query(true)
        .reply(200, {
            "pagination": {
                "object_count": 1,
                "page_number": 1,
                "page_size": 50,
                "page_count": 1,
                "has_more_items": false
            },
            "attendees": []
        });
}

module.exports = {
    getAttendees: getAttendees,
    getEvents: getEvents
};