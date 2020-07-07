const get = 'select id, day, value from capacity;';
const add = 'insert into capacity (id, day, value) values ($1, $2, $3);';
const update = 'update capacity set %s where id = %L;';
const remove = 'delete from capacity where id = ANY($1);';

module.exports = {
    get: get,
    add: add,
    update: update,
    remove: remove
}