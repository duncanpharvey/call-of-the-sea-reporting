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

exports.up = function(db) {
  return db.runSql(`create table boat_sails (
    id serial primary key not null,
    airtable_id char(17) unique not null,
    vessel_conducting_sail varchar(20) references vessel(name),
    boarding_date timestamp,
    disembarking_date timestamp,
	  status varchar(50),
    total_cost int,
	  total_passengers smallint
  );

  create table individual_sails (
	id serial primary key not null,
  airtable_id char(17) unique not null,
	vessel_conducting_sail varchar(20) references vessel(name),
  boarding_date timestamp,
  disembarking_date timestamp,
	status varchar(50),
  total_cost int
  );`);
};

exports.down = function(db) {
  return db.runSql(`drop table boat_sails;
    drop table individual_sails;`);
};

exports._meta = {
  "version": 1
};
