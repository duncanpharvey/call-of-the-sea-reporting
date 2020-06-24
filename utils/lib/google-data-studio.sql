select cal."date",
	v."name" as vessel_conducting_sail,
	sum(s.total_passengers) as total_passengers,
	sum(case when s."type" is null or cal."date" != s.boarding_date::date then 0 else s.total_cost end) as total_cost,
	sum(case
		when s."type" = 'boat' then 1
		when v."name" = 'Seaward' then total_passengers / (case when s.boarding_date::date = s.disembarking_date::date then 40 else 12 end::decimal)
		when v."name" = 'Matthew Turner' then total_passengers / (case when s.boarding_date::date = s.disembarking_date::date then 70 else 26 end::decimal)
	end *
	case
		when s."type" is null then 0
		when EXTRACT(epoch FROM (least(disembarking_date, date_trunc('day', cal."date") + interval '1 day') - greatest(boarding_date, date_trunc('day', cal."date")))) / 3600 <= 2 then 0.5
		when EXTRACT(epoch FROM (least(disembarking_date, date_trunc('day', cal."date") + interval '1 day') - greatest(boarding_date, date_trunc('day', cal."date")))) / 3600 <= 5 then 1
		when EXTRACT(epoch FROM (least(disembarking_date, date_trunc('day', cal."date") + interval '1 day') - greatest(boarding_date, date_trunc('day', cal."date")))) / 3600 <= 24 then 2
	end) as sailing_segments,
	cap.value as capacity
from calendar cal
cross join vessel v
left join (
	select 'individual' as "type", i.vessel_conducting_sail, i.boarding_date, i.disembarking_date, sum(i.total_cost) as total_cost, count(i.airtable_id) as total_passengers
	from individual_sails i
	where i.status != 'Cancelled'
	group by i.vessel_conducting_sail, i.boarding_date, i.disembarking_date
	
	union
	
	select 'boat' as "type", b.vessel_conducting_sail, b.boarding_date, b.disembarking_date, b.total_cost, b.total_passengers
	from boat_sails b
	where b.status != 'Cancelled'
) s on s.boarding_date::date <= cal."date" and cal."date" <= s.disembarking_date::date and v."name" = s.vessel_conducting_sail
join capacity cap on cap.id = date_part('dow', cal."date")
group by cal."date", cap.value, v."name"
order by cal."date", v."name"; 


/*
validation

by boat sails:

by individual sails:
1) event title - boarding date/time - disembarking date/time same across all participants

both:
1) no duplicate event ids (vessel + boarding date/time + disembarking date/time)
2) valid boarding / disembarking dates

capacity:
days are 0 - 6

business logic:
1) all revenue attributed to first day of sail for multi day sails
2) sail segment logic assumes multi day programs are overnights. Day programs that start in the afternoon or end in the morning will have an extra sail segment assigned
	a) change logic to set start/end of sailing day to be 9am - 8:30pm instead of midnight to midnight?
3) weighted capacity assumes multi day programs have the same capacity as overnight programs (true maybe for pandemic but not otherwise)
4) weighted capacity depends on vessel and day vs overnight sail

technical notes:
name queries to used in prepared statements
don't log if error

*/