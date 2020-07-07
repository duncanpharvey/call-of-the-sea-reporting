const { pool, Repository, Slack } = require('../config.js');

async function update() {
    await pool.query(Repository.Calendar.update).catch(err => Slack.post(err));
}

module.exports = {
    update: update
}