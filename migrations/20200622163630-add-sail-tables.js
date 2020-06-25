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
  return db.runSql(`create table boat_sails (
    id serial primary key not null,
    airtable_id char(17) unique not null,
    vessel_conducting_sail varchar(20) references vessel(name),
    boarding_date timestamp,
    disembarking_date timestamp,
	  status varchar(50) not null,
    total_cost int not null,
    scholarship_awarded int not null,
    paid int not null,
    outstanding int not null,
    total_passengers smallint not null,
    students smallint not null,
    adults smallint not null,
    created_date_utc timestamp default timezone('utc', now()),
    modified_date_utc timestamp default timezone('utc', now())
  );

  create table individual_sails (
    id serial primary key not null,
    airtable_id char(17) unique not null,
    vessel_conducting_sail varchar(20) references vessel(name),
    boarding_date timestamp,
    disembarking_date timestamp,
    status varchar(50) not null,
    total_cost int not null,
    scholarship_awarded int not null,
    paid int not null,
    outstanding int not null,
    created_date_utc timestamp default timezone('utc', now()),
    modified_date_utc timestamp default timezone('utc', now())
  );`);
};

exports.down = function (db) {
  return db.runSql(`drop table boat_sails;
    drop table individual_sails;`);
};

exports._meta = {
  "version": 1
};