-- Custom platforms: replace the fixed whitelist on series.app with a length check.
alter table public.series drop constraint if exists series_app_check;
alter table public.series add constraint series_app_check check (char_length(btrim(app)) between 1 and 30);
