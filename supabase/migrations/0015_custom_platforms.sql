-- Custom platforms list: anyone signed in can add; only the creator can delete, and only while no series uses it.
create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index if not exists platforms_name_uq on public.platforms (lower(btrim(name)));
alter table public.platforms enable row level security;
drop policy if exists pl_read on public.platforms;
create policy pl_read on public.platforms for select to authenticated using (true);
drop policy if exists pl_insert on public.platforms;
create policy pl_insert on public.platforms for insert to authenticated with check (created_by = (select auth.uid()));
drop policy if exists pl_delete on public.platforms;
create policy pl_delete on public.platforms for delete to authenticated
  using (created_by = (select auth.uid())
    and not exists (select 1 from public.series s where lower(btrim(s.app)) = lower(btrim(name))));
