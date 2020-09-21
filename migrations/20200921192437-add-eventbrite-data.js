'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`ALTER TABLE individual_sails
  ADD COLUMN eventbrite_attendee_id varchar(12),
  ADD COLUMN eventbrite_order_id varchar(12),
  ADD COLUMN eventbrite_event_id varchar(15);`);
};

exports.down = function (db) {
  return db.runSql(`ALTER TABLE individual_sails
  DROP COLUMN eventbrite_attendee_id,
  DROP COLUMN eventbrite_order_id,
  DROP COLUMN eventbrite_event_id;`);
};

exports._meta = {
  "version": 1
};
