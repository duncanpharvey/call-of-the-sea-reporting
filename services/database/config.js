const { Pool } = require('pg');
const { Slack } = require('../../utils');

module.exports = {
    format: require('pg-format'),
    moment: require('moment'),
    pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    }),
    Query: require('./query'),
    Slack: Slack
};