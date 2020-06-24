#!/usr/bin/env node
const app = require('../app.js');
const app2 = require('../app2.js');

async function main() {
    await app.run();
    await app2.main();
}

main();