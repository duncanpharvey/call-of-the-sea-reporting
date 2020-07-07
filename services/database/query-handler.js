const { pool } = require('./config.js');

async function get(sql) {
    return await pool.query(sql).then((response) => { return response.rows });
}

async function update(sql) {

}

async function query(text, values) {
    await pool.query({ text, values });
}

module.exports = {
    get: get,
    query: query
};