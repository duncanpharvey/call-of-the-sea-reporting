'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`ALTER TABLE individual_sails
  ADD COLUMN passenger_capacity_override smallint;`);
};

exports.down = function (db) {
  return db.runSql(`ALTER TABLE individual_sails
  DROP COLUMN passenger_capacity_override;`);
};

exports._meta = {
  "version": 1
};