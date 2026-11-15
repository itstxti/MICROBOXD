create table if not exists public.list_likes (
  list_id uuid not null references public.lists(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, user_id)
);
create index if not exists list_likes_user_idx on public.list_likes(user_id);
alter table public.list_likes enable row level security;
drop policy if exists ll_read on public.list_likes;
create policy ll_read on public.list_likes for select to authenticated using (true);
drop policy if exists ll_insert on public.list_likes;
create policy ll_insert on public.list_likes for insert to authenticated
  with check (user_id = (select auth.uid())
    and not exists (select 1 from public.lists l where l.id = list_id and l.user_id = (select auth.uid())));
drop policy if exists ll_delete on public.list_likes;
create policy ll_delete on public.list_likes for delete to authenticated using (user_id = (select auth.uid()));
