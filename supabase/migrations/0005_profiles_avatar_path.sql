-- Foto de perfil: ruta en el bucket covers (carpeta = uid)
alter table public.profiles add column if not exists avatar_path text;
