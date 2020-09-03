const { axios, eventbriteDateFormat, moment } = require('../config.js');

async function get(checkPast = false) {
    const req = {
        method: 'get',
        url: `https://www.eventbriteapi.com/v3/organizations/${process.env.eventbrite_organization_id}/events`,
        headers: { Authorization: `Bearer ${process.env.eventbrite_token}` },
        params: { status: 'live,started,ended,completed' } // exclude draft and cancelled events
    }

    if (checkPast) { req.params.time_filter = 'all'; }
    else { req.params.time_filter = 'current_future'; } // only future events

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

    events = events.filter(event => moment(event.start.utc, eventbriteDateFormat).isAfter('2020-05-01T00:00:00Z')); // filter by specific date (first Eventbrite event in Airtable is in May 2020)
    return events;
}

module.exports = {
    get: get
};