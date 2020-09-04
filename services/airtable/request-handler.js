const { base } = require('./config.js');

async function get(table, fields, formula = '') {
    return await base(table).select({ fields: fields, filterByFormula: formula }).all().then((records) => records.map(r => r._rawJson));
}

async function add(table, records) {
    var i, n, tempArr, chunk = 10;
    for (i = 0, n = records.length; i < n; i += chunk) {
        tempArr = records.slice(i, i + chunk);
        base(table).create(tempArr, { typecast: true });
    }
}

async function update(table, records) {
    var i, n, tempArr, chunk = 10;
    for (i = 0, n = records.length; i < n; i += chunk) {
        tempArr = records.slice(i, i + chunk);
        base(table).update(tempArr, { typecast: true });
    }
}

module.exports = {
    add: add,
    get: get,
    update: update
};