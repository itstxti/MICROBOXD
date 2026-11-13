create extension if not exists pg_trgm with schema extensions;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null default '' check (char_length(display_name) <= 80),
  family_name text not null default '' check (char_length(family_name) <= 80),
  location text not null default '' check (char_length(location) <= 80),
  website text not null default '' check (char_length(website) <= 200),
  pronouns text not null default '' check (char_length(pronouns) <= 40),
  bio text not null default '' check (char_length(bio) <= 400),
  avatar_url text,
  favorites uuid[] not null default '{}' check (cardinality(favorites) <= 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare base text; uname text;
begin
  base := regexp_replace(lower(split_part(coalesce(new.email,'user'),'@',1)),'[^a-z0-9_]','','g');
  if char_length(base) < 3 then base := 'user' || base; end if;
  base := left(base, 16);
  uname := base || '_' || substr(replace(new.id::text,'-',''),1,6);
  insert into public.profiles(id, username, display_name, avatar_url)
  values (new.id, uname, left(coalesce(new.raw_user_meta_data->>'name',''),80), new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.series (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  app text not null check (app in ('DramaBox','ReelShort','ShortMax','GoodShort','FlexTV','Otra')),
  synopsis text not null default '' check (char_length(synopsis) <= 2000),
  tropes text[] not null default '{}' check (cardinality(tropes) <= 20),
  cast_text text not null default '' check (char_length(cast_text) <= 2000),
  episodes int not null default 1 check (episodes between 1 and 2000),
  cover_path text,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index series_title_trgm on public.series using gin (title extensions.gin_trgm_ops);
create index series_app_idx on public.series(app);
create index series_tropes_idx on public.series using gin (tropes);
create index series_created_by_idx on public.series(created_by);
create trigger series_updated before update on public.series for each row execute function public.set_updated_at();

create table public.user_series (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  status text not null default 'want' check (status in ('want','watching','done')),
  watched_eps int not null default 0 check (watched_eps >= 0),
  rating numeric(2,1) check (rating between 0.5 and 5 and (rating*2) = floor(rating*2)),
  liked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, series_id)
);
create index user_series_series_idx on public.user_series(series_id);
create trigger user_series_updated before update on public.user_series for each row execute function public.set_updated_at();

create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  watched_on date not null default current_date,
  rating numeric(2,1) check (rating between 0.5 and 5 and (rating*2) = floor(rating*2)),
  liked boolean not null default false,
  rewatch boolean not null default false,
  review text not null default '' check (char_length(review) <= 10000),
  spoilers boolean not null default false,
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  created_at timestamptz not null default now()
);
create index diary_user_date_idx on public.diary_entries(user_id, watched_on desc);
create index diary_series_idx on public.diary_entries(series_id);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  ranked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index lists_user_idx on public.lists(user_id);
create trigger lists_updated before update on public.lists for each row execute function public.set_updated_at();

create table public.list_items (
  list_id uuid not null references public.lists(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  position int not null default 0,
  primary key (list_id, series_id)
);
create index list_items_series_idx on public.list_items(series_id);

create table public.follows (
  follower_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows(followee_id);

alter table public.profiles enable row level security;
alter table public.series enable row level security;
alter table public.user_series enable row level security;
alter table public.diary_entries enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.follows enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy series_read on public.series for select to authenticated using (true);
create policy series_insert on public.series for insert to authenticated with check (created_by = (select auth.uid()));
create policy series_update on public.series for update to authenticated using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

create policy us_read on public.user_series for select to authenticated using (true);
create policy us_insert on public.user_series for insert to authenticated with check (user_id = (select auth.uid()));
create policy us_update on public.user_series for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy us_delete on public.user_series for delete to authenticated using (user_id = (select auth.uid()));

create policy de_read on public.diary_entries for select to authenticated using (true);
create policy de_insert on public.diary_entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy de_update on public.diary_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy de_delete on public.diary_entries for delete to authenticated using (user_id = (select auth.uid()));

create policy lists_read on public.lists for select to authenticated using (true);
create policy lists_insert on public.lists for insert to authenticated with check (user_id = (select auth.uid()));
create policy lists_update on public.lists for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy lists_delete on public.lists for delete to authenticated using (user_id = (select auth.uid()));

create policy li_read on public.list_items for select to authenticated using (true);
create policy li_write on public.list_items for all to authenticated
  using (exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())))
  with check (exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())));

create policy follows_read on public.follows for select to authenticated using (true);
create policy follows_insert on public.follows for insert to authenticated with check (follower_id = (select auth.uid()));
create policy follows_delete on public.follows for delete to authenticated using (follower_id = (select auth.uid()));

create view public.series_stats with (security_invoker = on) as
select s.id as series_id,
  count(u.rating) as n_ratings,
  round(avg(u.rating),1) as avg_rating,
  count(u.user_id) filter (where u.status = 'done') as members,
  (select count(*) from public.diary_entries d where d.series_id = s.id and d.review <> '') as reviews,
  (select count(*) from public.list_items li where li.series_id = s.id) as lists,
  array[
    count(*) filter (where u.rating = 0.5), count(*) filter (where u.rating = 1), count(*) filter (where u.rating = 1.5),
    count(*) filter (where u.rating = 2),   count(*) filter (where u.rating = 2.5), count(*) filter (where u.rating = 3),
    count(*) filter (where u.rating = 3.5), count(*) filter (where u.rating = 4),   count(*) filter (where u.rating = 4.5),
    count(*) filter (where u.rating = 5)] as histogram
from public.series s left join public.user_series u on u.series_id = s.id
group by s.id;

create or replace function public.similar_series(q text, min_sim real default 0.3)
returns table(id uuid, title text, app text, sim real)
language sql stable security invoker set search_path = '' as $$
  select s.id, s.title, s.app, extensions.similarity(s.title, q) as sim
  from public.series s
  where extensions.similarity(s.title, q) >= min_sim
  order by sim desc limit 8
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers','covers', true, 1048576, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy covers_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy covers_update on storage.objects for update to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy covers_delete on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
