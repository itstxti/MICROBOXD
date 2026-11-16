alter table public.series add column if not exists episode_minutes numeric(5,1) check (episode_minutes > 0 and episode_minutes <= 600);
notify pgrst, 'reload schema';
