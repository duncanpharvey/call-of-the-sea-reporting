const { Query, pgtest } = require('../../config.js');

function update(response) {
    pgtest.expect(Query.Calendar.update).returning(null, null);
}

module.exports = {
    update: update
};