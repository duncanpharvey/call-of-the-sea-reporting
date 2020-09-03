const { base } = require('./config.js');

async function get(table, fields, formula) {
    return await base(table).select({ fields: fields, filterByFormula: formula }).all().then((records) => records.map(r => r._rawJson));
}

module.exports = {
    get: get
};