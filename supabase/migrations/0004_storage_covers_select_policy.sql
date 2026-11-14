-- upload con upsert (INSERT ... ON CONFLICT ... RETURNING) necesita poder SELECT la fila propia.
-- Las URLs públicas del bucket siguen funcionando sin política; esto solo cubre al propietario autenticado.
create policy covers_select_own on storage.objects for select to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = (select auth.uid())::text);
