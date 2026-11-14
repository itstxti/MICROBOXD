create table public.review_likes (
  entry_id uuid not null references public.diary_entries(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);
create index review_likes_user_idx on public.review_likes(user_id);
alter table public.review_likes enable row level security;
create policy rl_read on public.review_likes for select to authenticated using (true);
create policy rl_insert on public.review_likes for insert to authenticated
  with check (user_id = (select auth.uid())
    and not exists (select 1 from public.diary_entries d where d.id = entry_id and d.user_id = (select auth.uid())));
create policy rl_delete on public.review_likes for delete to authenticated using (user_id = (select auth.uid()));

create index diary_series_review_idx on public.diary_entries(series_id, created_at desc) where review <> '';
create index diary_user_created_idx on public.diary_entries(user_id, created_at desc);
create index profiles_username_trgm on public.profiles using gin (username extensions.gin_trgm_ops);
create index profiles_display_trgm on public.profiles using gin (display_name extensions.gin_trgm_ops);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare base text; uname text;
begin
  base := regexp_replace(lower(split_part(coalesce(new.email,'user'),'@',1)),'[^a-z0-9_]','','g');
  if char_length(base) < 3 then base := 'user' || base; end if;
  base := left(base, 16);
  uname := base || '_' || substr(replace(new.id::text,'-',''),1,6);
  insert into public.profiles(id, username, display_name, avatar_url)
  values (new.id, uname, left(coalesce(nullif(new.raw_user_meta_data->>'name',''), base),80), new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
