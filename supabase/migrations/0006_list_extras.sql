-- Extras de listas (estilo Letterboxd): etiquetas, quién puede responder y notas/spoilers por entrada.
-- Seguro de ejecutar varias veces. Las filas existentes quedan con los valores por defecto.

alter table public.lists
  add column if not exists tags text[] not null default '{}',
  add column if not exists replies smallint not null default 0;

-- 0 = cualquiera puede responder, 1 = solo amigos, 2 = nadie
alter table public.lists drop constraint if exists lists_replies_check;
alter table public.lists add constraint lists_replies_check check (replies between 0 and 2);

alter table public.list_items
  add column if not exists note text not null default '',
  add column if not exists spoiler boolean not null default false;

-- Las políticas RLS existentes (lists_*, li_*) ya cubren las columnas nuevas.
