const { pool, Query, Slack } = require('../config.js');

async function update() {
    const sql = Query.Calendar.update;
    await pool.query(sql).catch(err => Slack.post(err));
}

module.exports = {
    update: update
}