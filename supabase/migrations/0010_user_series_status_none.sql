-- Paso 1 (aditivo, seguro de aplicar antes de desplegar el front nuevo).
-- "watching" nunca fue un estado real de visionado: la app lo usaba como código
-- para "sin estado" (serie con like pero ni vista ni en watchlist).
-- Se admite 'none' para ese caso, manteniendo 'watching' mientras haya clientes antiguos.
alter table public.user_series drop constraint if exists user_series_status_check;
alter table public.user_series
  add constraint user_series_status_check check (status in ('none','want','watching','done'));
