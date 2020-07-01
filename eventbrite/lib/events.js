const axios = require('axios');

async function get(checkPast = false) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/organizations/${process.env.eventbrite_organization_id}/events`,
        headers: { Authorization: `Bearer ${process.env.eventbrite_token}` },
        params: { status: 'live,started,ended,completed' } // exclude draft and cancelled events
    }

    if (!checkPast) { req.params.time_filter = 'current_future' } // only future events

    var events = [];
    var morePages = false;
    do {
        await axios(req).then((res) => {
            morePages = res.data.pagination.has_more_items;
            if (morePages) { req.params.continuation = res.data.pagination.continuation; }
            events = events.concat(res.data.events);
        });
    }
    while (morePages);

    return events;
}

module.exports = {
    get: get
};