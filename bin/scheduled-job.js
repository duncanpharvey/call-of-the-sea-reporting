#!/usr/bin/env node
const cron = require('node-cron');
const app = require('../app.js');

cron.schedule("0 * * * *", app.main); // run every hour at minute 0