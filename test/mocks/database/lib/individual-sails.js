const { Query, pgtest } = require('../../config.js');

function get(response) {
    pgtest.expect(Query.IndividualSails.get).returning(null, response);
}

module.exports = {
    get: get
};