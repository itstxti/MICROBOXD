-- Paso 2: aplicar DESPUÉS de desplegar el front con 'none' y recargar la app (el cliente ya no entiende 'watching').
-- Convierte las filas antiguas con la misma regla que usaba el cliente al leerlas:
--   watching + watchlist = false -> 'none'    |    watching + watchlist = true -> 'want'
update public.user_series
   set status = case when watchlist then 'want' else 'none' end
 where status = 'watching';

alter table public.user_series drop constraint if exists user_series_status_check;
alter table public.user_series
  add constraint user_series_status_check check (status in ('none','want','done'));
