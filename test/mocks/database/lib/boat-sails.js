const { Query, pgtest } = require('../../config.js');

function get(response) {
    pgtest.expect(Query.BoatSails.get).returning(null, response);
}

module.exports = {
    get: get
};