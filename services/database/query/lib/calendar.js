const update = `do $$
declare
check_date date := greatest('2019-06-01', (select max(date) from calendar) + INTERVAL '1 day');
end_date date := current_date + INTERVAL '2 years';

begin
while check_date <= end_date loop
insert into calendar(date) values(check_date);
check_date := check_date + INTERVAL '1 day';
end loop;
end $$;`;

module.exports = {
    update: update
}