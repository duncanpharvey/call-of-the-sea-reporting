const { Pool } = require('pg');
const { Slack } = require('../utils');

module.exports = {
    moment: require('moment'),
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    Slack: Slack
};