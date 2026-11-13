# Microboxd

Un "Letterboxd" para microseries (DramaBox, ReelShort, ShortMax…). Front estático de un solo archivo (`index.html`) + Supabase (Auth con Google, Postgres con RLS y Storage).

## Arquitectura
- `index.html`: la app completa. Usa `@supabase/supabase-js` desde CDN y la *publishable key* (pública por diseño; la seguridad la dan las políticas RLS).
- `supabase/migrations/`: esquema SQL (perfiles, catálogo, estado por usuario, diario, listas, follows, vista de estadísticas, bucket `covers`).
- `vercel.json`: cabeceras de seguridad. Vercel sirve el sitio estático.

## Configurar el login con Google (una sola vez)
1. Google Cloud Console → *APIs y servicios* → *Credenciales* → crear **ID de cliente OAuth** (aplicación web).
   - URI de redirección autorizada: `https://xmfpzbzctgnzqoidtqhs.supabase.co/auth/v1/callback`
2. Supabase → *Authentication* → *Sign In / Providers* → **Google**: pega Client ID y Client Secret y actívalo.
3. Supabase → *Authentication* → *URL Configuration*: **Site URL** = tu dominio de Vercel, y añade esa URL (y `http://localhost:3000`) a *Redirect URLs*.

## Desarrollo local
```
npx serve .
```

## Notas
- Al primer login, los datos que hubiera en `localStorage` (versión anterior) se importan a la cuenta.
- El catálogo se carga entero (hasta 1000 series) en el cliente. Cuando crezca, mover la búsqueda a servidor (`pg_trgm` ya está activo).
