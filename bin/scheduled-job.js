#!/usr/bin/env node
const app = require('../app.js');
const app2 = require('../app2.js');

await app.run();
await app2.main();
