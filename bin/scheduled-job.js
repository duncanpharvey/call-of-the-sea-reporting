#!/usr/bin/env node
const tasks = require('../tasks');

console.log('running!');

tasks.airtableToGoogleSheets.main();