alter table public.series add column if not exists duration_minutes numeric(7,1) check (duration_minutes > 0 and duration_minutes <= 20000);
update public.series set duration_minutes = round(episode_minutes * episodes, 1) where episode_minutes is not null and duration_minutes is null;
alter table public.series drop column if exists episode_minutes;
notify pgrst, 'reload schema';
