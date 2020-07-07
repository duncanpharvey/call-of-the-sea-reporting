const { base } = require('./config.js');

async function get(table, fields) {
    return await base(table).select({ fields: fields }).all().then((records) => records.map(r => r._rawJson));
}

module.exports = {
    get: get
};