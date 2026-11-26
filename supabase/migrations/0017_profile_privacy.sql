-- 0017: profile privacy.
--
-- Until now every table was readable by every signed-in user (using (true)).
-- This migration adds a per-profile visibility and enforces it in RLS:
--   public  : anyone signed in can see the profile's diary, reviews, lists, follows.
--   private : only the owner and followers the owner has approved can.
-- Name, username, avatar and the profile row itself stay readable so people can
-- find an account and ask to follow it.
--
-- Everything defaults to 'public', so applying this changes nothing until a
-- user opts in. To roll back: restore the `using (true)` policies from 0001/0002/0008.

-- 1. Settings -----------------------------------------------------------------
alter table public.profiles
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'private')),
  -- Do this member's ratings/reviews count in the global averages and counts?
  add column if not exists count_in_stats boolean not null default true,
  -- Listed in member search? (UI-level only: usernames are not secret, they
  -- appear next to every review.)
  add column if not exists discoverable boolean not null default true;

-- 2. Follow requests ----------------------------------------------------------
alter table public.follows
  add column if not exists status text not null default 'accepted'
    check (status in ('accepted', 'pending'));

create index if not exists follows_followee_status_idx on public.follows (followee_id, status);

-- The server decides the status; a client can never insert itself as accepted.
create or replace function public.follows_set_status() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.status := case
      when exists (select 1 from public.profiles p where p.id = new.followee_id and p.visibility = 'private')
      then 'pending' else 'accepted' end;
  else
    -- Only the status may change, and only pending -> accepted.
    if new.follower_id <> old.follower_id or new.followee_id <> old.followee_id
       or new.created_at <> old.created_at or new.status <> 'accepted' then
      raise exception 'only accepting a pending request is allowed';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists follows_status on public.follows;
create trigger follows_status before insert or update on public.follows
  for each row execute function public.follows_set_status();

-- Going public accepts every pending request.
create or replace function public.profile_visibility_changed() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.visibility = 'public' and old.visibility = 'private' then
    update public.follows set status = 'accepted' where followee_id = new.id and status = 'pending';
  end if;
  return new;
end $$;

drop trigger if exists profiles_visibility on public.profiles;
create trigger profiles_visibility after update of visibility on public.profiles
  for each row when (old.visibility is distinct from new.visibility)
  execute function public.profile_visibility_changed();

-- 3. can_view ------------------------------------------------------------------
-- SECURITY DEFINER so it can read follows even though follows is itself filtered.
create or replace function public.can_view(owner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select owner = (select auth.uid())
      or exists (select 1 from public.profiles p where p.id = owner and p.visibility = 'public')
      or exists (select 1 from public.follows f
                 where f.follower_id = (select auth.uid()) and f.followee_id = owner and f.status = 'accepted');
$$;
revoke all on function public.can_view(uuid) from public, anon;
grant execute on function public.can_view(uuid) to authenticated;

-- 4. Read policies --------------------------------------------------------------
drop policy if exists us_read on public.user_series;
create policy us_read on public.user_series for select to authenticated
  using ((select public.can_view(user_id)));

drop policy if exists de_read on public.diary_entries;
create policy de_read on public.diary_entries for select to authenticated
  using ((select public.can_view(user_id)));

drop policy if exists lists_read on public.lists;
create policy lists_read on public.lists for select to authenticated
  using ((select public.can_view(user_id)));

-- list_items / likes inherit visibility from the row they hang on (RLS of the
-- parent table applies inside these sub-selects).
drop policy if exists li_read on public.list_items;
create policy li_read on public.list_items for select to authenticated
  using (exists (select 1 from public.lists l where l.id = list_id));

drop policy if exists rl_read on public.review_likes;
create policy rl_read on public.review_likes for select to authenticated
  using (
    exists (select 1 from public.diary_entries d where d.id = entry_id)
    and ((select public.can_view(user_id))
         or exists (select 1 from public.diary_entries d where d.id = entry_id and d.user_id = (select auth.uid())))
  );

drop policy if exists ll_read on public.list_likes;
create policy ll_read on public.list_likes for select to authenticated
  using (
    exists (select 1 from public.lists l where l.id = list_id)
    and ((select public.can_view(user_id))
         or exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())))
  );

-- follows: you see edges you are part of, plus accepted edges where both people
-- are visible to you (so a private account's follower lists are not exposed).
drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows for select to authenticated
  using (
    follower_id = (select auth.uid()) or followee_id = (select auth.uid())
    or (status = 'accepted' and (select public.can_view(follower_id)) and (select public.can_view(followee_id)))
  );

-- The followee can accept; either side can delete (unfollow / decline / remove follower).
drop policy if exists follows_update on public.follows;
create policy follows_update on public.follows for update to authenticated
  using (followee_id = (select auth.uid()))
  with check (followee_id = (select auth.uid()) and status = 'accepted');

drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows for delete to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));

-- 5. Global stats ----------------------------------------------------------------
-- Aggregates only (no per-person rows), computed with the view owner's rights so
-- every viewer sees the same numbers. Members with count_in_stats = false are left out.
create or replace view public.series_stats with (security_invoker = off) as
with ok as (select id from public.profiles where count_in_stats)
select s.id as series_id,
  count(u.rating) as n_ratings,
  round(avg(u.rating), 1) as avg_rating,
  count(u.user_id) filter (where u.status = 'done') as members,
  (select count(*) from public.diary_entries d
     where d.series_id = s.id and d.review <> '' and d.user_id in (select id from ok)) as reviews,
  (select count(*) from public.list_items li join public.lists l on l.id = li.list_id
     where li.series_id = s.id and l.user_id in (select id from ok)) as lists,
  array[
    count(*) filter (where u.rating = 0.5), count(*) filter (where u.rating = 1), count(*) filter (where u.rating = 1.5),
    count(*) filter (where u.rating = 2),   count(*) filter (where u.rating = 2.5), count(*) filter (where u.rating = 3),
    count(*) filter (where u.rating = 3.5), count(*) filter (where u.rating = 4),   count(*) filter (where u.rating = 4.5),
    count(*) filter (where u.rating = 5)] as histogram
from public.series s
left join public.user_series u on u.series_id = s.id and u.user_id in (select id from ok)
group by s.id;

revoke all on public.series_stats from anon;
grant select on public.series_stats to authenticated;
