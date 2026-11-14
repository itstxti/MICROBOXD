-- Permite al creador de una serie eliminarla.
-- Las filas de user_series, diary_entries y list_items asociadas se borran en cascada.
create policy series_delete on public.series for delete to authenticated
  using (created_by = (select auth.uid()));
