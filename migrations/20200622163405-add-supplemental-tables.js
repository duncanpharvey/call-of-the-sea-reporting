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
  return db.runSql(`create table calendar (
    date date primary key not null,
    created_date_utc timestamp default timezone('utc', now()),
    modified_date_utc timestamp default timezone('utc', now())
  );

  create table capacity (
    id smallint primary key not null,
    day varchar(9) not null,
    value smallint not null,
    created_date_utc timestamp default timezone('utc', now()),
    modified_date_utc timestamp default timezone('utc', now())
  );

  create table vessel (
    id serial primary key not null,
    name varchar(20) unique not null,
    created_date_utc timestamp default timezone('utc', now()),
    modified_date_utc timestamp default timezone('utc', now())
  );

  insert into vessel (name) values ('seaward');
  insert into vessel (name) values ('matthew turner');`);
};

exports.down = function (db) {
  return db.runSql(`drop table calendar;
  drop table capacity;
  drop table vessel;`);
};

exports._meta = {
  "version": 1
};