const axios = require('axios');

async function get(eventId) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/events/${eventId}/attendees`,
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

    return attendees;
}

module.exports = {
    get: get
};