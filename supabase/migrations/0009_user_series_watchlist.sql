-- Permite tener una serie en la watchlist aunque ya esté vista (status = 'done').
alter table public.user_series add column if not exists watchlist boolean not null default false;
update public.user_series set watchlist = true where status in ('want','watching');
