-- RLS tests for 0017_profile_privacy.sql. Run on a scratch database that already
-- has migrations 0001-0017 applied (never on production: it inserts fake users).
-- Usage: psql -v ON_ERROR_STOP=1 -f supabase/tests/0017_privacy.sql
begin;
create or replace function public.t_as_user(u uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(u::text,''), true); end $$;
create or replace function public.t_eq(name text, got bigint, want bigint) returns void language plpgsql as $$
begin if got is distinct from want then raise exception 'FAIL %: got % want %', name, got, want; end if; raise notice 'ok   %', name; end $$;

grant execute on all functions in schema public to authenticated;
-- Supabase grants table privileges to authenticated by default; RLS is what limits them.
grant select, insert, update, delete on all tables in schema public to authenticated;
-- fixtures (as superuser): A public, B private, C approved follower of B, D stranger, E pending follower of B
insert into auth.users(id,email) select x, x||'@t.dev' from unnest(array[
  'aaaaaaaa-0000-4000-8000-000000000001','bbbbbbbb-0000-4000-8000-000000000002','cccccccc-0000-4000-8000-000000000003',
  'dddddddd-0000-4000-8000-000000000004','eeeeeeee-0000-4000-8000-000000000005']::uuid[]) x;
update public.profiles set username='user_'||substr(id::text,1,4) where id in (select id from auth.users);
update public.profiles set visibility='private' where id='bbbbbbbb-0000-4000-8000-000000000002';
insert into public.series(id,title,app,created_by) values ('99999999-0000-4000-8000-000000000001','S1','DramaBox','aaaaaaaa-0000-4000-8000-000000000001');
insert into public.user_series(user_id,series_id,status,rating) values
  ('aaaaaaaa-0000-4000-8000-000000000001','99999999-0000-4000-8000-000000000001','done',4),
  ('bbbbbbbb-0000-4000-8000-000000000002','99999999-0000-4000-8000-000000000001','done',2);
insert into public.diary_entries(id,user_id,series_id,review) values
  ('11111111-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-000000000001','99999999-0000-4000-8000-000000000001','public review'),
  ('11111111-0000-4000-8000-00000000000b','bbbbbbbb-0000-4000-8000-000000000002','99999999-0000-4000-8000-000000000001','private review');
insert into public.lists(id,user_id,name) values
  ('22222222-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-000000000001','A list'),
  ('22222222-0000-4000-8000-00000000000b','bbbbbbbb-0000-4000-8000-000000000002','B list');
insert into public.list_items(list_id,series_id) values
  ('22222222-0000-4000-8000-00000000000a','99999999-0000-4000-8000-000000000001'),
  ('22222222-0000-4000-8000-00000000000b','99999999-0000-4000-8000-000000000001');
insert into public.review_likes(entry_id,user_id) values
  ('11111111-0000-4000-8000-00000000000b','bbbbbbbb-0000-4000-8000-000000000002'),  -- B likes own private review
  ('11111111-0000-4000-8000-00000000000a','bbbbbbbb-0000-4000-8000-000000000002');  -- B (private) likes A's public review
-- follows inserted as superuser bypass nothing: trigger sets status from target visibility
insert into public.follows(follower_id,followee_id) values
  ('cccccccc-0000-4000-8000-000000000003','bbbbbbbb-0000-4000-8000-000000000002'),
  ('eeeeeeee-0000-4000-8000-000000000005','bbbbbbbb-0000-4000-8000-000000000002'),
  ('dddddddd-0000-4000-8000-000000000004','aaaaaaaa-0000-4000-8000-000000000001');
update public.follows set status='accepted' where follower_id='cccccccc-0000-4000-8000-000000000003';

select public.t_eq('trigger: follow of private account starts pending',
  (select count(*) from public.follows where follower_id='eeeeeeee-0000-4000-8000-000000000005' and status='pending'),1);
select public.t_eq('trigger: follow of public account is accepted',
  (select count(*) from public.follows where follower_id='dddddddd-0000-4000-8000-000000000004' and status='accepted'),1);

set local role authenticated;

-- stranger D
select public.t_as_user('dddddddd-0000-4000-8000-000000000004');
select public.t_eq('stranger sees public diary', (select count(*) from public.diary_entries where user_id='aaaaaaaa-0000-4000-8000-000000000001'),1);
select public.t_eq('stranger cannot see private diary', (select count(*) from public.diary_entries where user_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('stranger cannot see private user_series', (select count(*) from public.user_series where user_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('stranger cannot see private list', (select count(*) from public.lists where user_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('stranger cannot see private list items', (select count(*) from public.list_items where list_id='22222222-0000-4000-8000-00000000000b'),0);
select public.t_eq('stranger sees public list items', (select count(*) from public.list_items where list_id='22222222-0000-4000-8000-00000000000a'),1);
select public.t_eq('stranger cannot see private account follower edges', (select count(*) from public.follows where followee_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('stranger cannot see a private user''s like on a public review', (select count(*) from public.review_likes where user_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('profile row stays readable (header)', (select count(*) from public.profiles where id='bbbbbbbb-0000-4000-8000-000000000002'),1);
select public.t_eq('stats count both ratings (count_in_stats default true)', (select n_ratings from public.series_stats where series_id='99999999-0000-4000-8000-000000000001'),2);

-- approved follower C
select public.t_as_user('cccccccc-0000-4000-8000-000000000003');
select public.t_eq('approved follower sees private diary', (select count(*) from public.diary_entries where user_id='bbbbbbbb-0000-4000-8000-000000000002'),1);
select public.t_eq('approved follower sees private list items', (select count(*) from public.list_items where list_id='22222222-0000-4000-8000-00000000000b'),1);

-- pending follower E
select public.t_as_user('eeeeeeee-0000-4000-8000-000000000005');
select public.t_eq('pending follower cannot see private diary', (select count(*) from public.diary_entries where user_id='bbbbbbbb-0000-4000-8000-000000000002'),0);
select public.t_eq('pending follower sees own pending edge', (select count(*) from public.follows where follower_id='eeeeeeee-0000-4000-8000-000000000005'),1);

-- client cannot self-approve or insert as accepted
do $$ begin
  begin update public.follows set status='accepted' where follower_id='eeeeeeee-0000-4000-8000-000000000005';
    if found then raise exception 'FAIL follower self-approved'; end if;
  exception when others then if sqlerrm like 'FAIL%' then raise; end if; end;
  raise notice 'ok   follower cannot self-approve';
end $$;

-- owner B approves E, sees everything of own
select public.t_as_user('bbbbbbbb-0000-4000-8000-000000000002');
select public.t_eq('owner sees own private diary', (select count(*) from public.diary_entries where user_id='bbbbbbbb-0000-4000-8000-000000000002'),1);
select public.t_eq('owner sees follower edges (2 accepted/pending)', (select count(*) from public.follows where followee_id='bbbbbbbb-0000-4000-8000-000000000002'),2);
update public.follows set status='accepted' where follower_id='eeeeeeee-0000-4000-8000-000000000005';
select public.t_eq('owner can accept a request', (select count(*) from public.follows where followee_id='bbbbbbbb-0000-4000-8000-000000000002' and status='accepted'),2);
select public.t_as_user('eeeeeeee-0000-4000-8000-000000000005');
select public.t_eq('after approval E sees private diary', (select count(*) from public.diary_entries where user_id='bbbbbbbb-0000-4000-8000-000000000002'),1);

-- author of a public review still sees a private user's like on it
select public.t_as_user('aaaaaaaa-0000-4000-8000-000000000001');
select public.t_eq('review author sees private user''s like', (select count(*) from public.review_likes where entry_id='11111111-0000-4000-8000-00000000000a'),1);

-- stats opt-out (separate setting)
select public.t_as_user('bbbbbbbb-0000-4000-8000-000000000002');
update public.profiles set count_in_stats=false where id='bbbbbbbb-0000-4000-8000-000000000002';
select public.t_as_user('dddddddd-0000-4000-8000-000000000004');
select public.t_eq('stats exclude opted-out member', (select n_ratings from public.series_stats where series_id='99999999-0000-4000-8000-000000000001'),1);
select public.t_eq('stats reviews exclude opted-out member', (select reviews from public.series_stats where series_id='99999999-0000-4000-8000-000000000001'),1);

-- going public accepts pending requests
reset role;
insert into auth.users(id,email) values ('ffffffff-0000-4000-8000-000000000006','f@t.dev');
update public.profiles set visibility='private' where id='ffffffff-0000-4000-8000-000000000006';
insert into public.follows(follower_id,followee_id) values ('dddddddd-0000-4000-8000-000000000004','ffffffff-0000-4000-8000-000000000006');
select public.t_eq('pending before going public', (select count(*) from public.follows where followee_id='ffffffff-0000-4000-8000-000000000006' and status='pending'),1);
update public.profiles set visibility='public' where id='ffffffff-0000-4000-8000-000000000006';
select public.t_eq('going public accepts pending', (select count(*) from public.follows where followee_id='ffffffff-0000-4000-8000-000000000006' and status='accepted'),1);
rollback;
