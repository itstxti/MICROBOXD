-- Reparto estructurado: [{ "name": "...", "role": "...", "photo": "<uid>/<series>/c0.jpg" }]
-- (cast_text se mantiene por compatibilidad con series antiguas)
alter table public.series
  add column cast_members jsonb not null default '[]'::jsonb
  check (jsonb_typeof(cast_members) = 'array' and jsonb_array_length(cast_members) <= 30);
