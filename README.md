# Microboxd

Un "Letterboxd" para microseries (DramaBox, ReelShort, ShortMax…). Front estático de un solo archivo (`index.html`) + Supabase (Auth con correo, Postgres con RLS y Storage).

## Arquitectura
- `index.html`: la app completa. Usa `@supabase/supabase-js` desde CDN y la *publishable key* (pública por diseño; la seguridad la dan las políticas RLS).
- `supabase/migrations/`: esquema SQL (perfiles, catálogo, estado por usuario, diario, listas, follows, vista de estadísticas, bucket `covers`).
- `vercel.json`: cabeceras de seguridad. Vercel sirve el sitio estático.

## Login con correo y contraseña
Activado por defecto en Supabase (*Authentication → Sign In / Providers → Email*).
1. *Authentication → URL Configuration*: **Site URL** = tu dominio de Vercel; añade esa URL (y `http://localhost:3000`) a *Redirect URLs*.
2. Por defecto Supabase exige **confirmar el correo**. El SMTP integrado solo envía unos pocos correos por hora: para producción configura un SMTP propio (*Authentication → SMTP Settings*). Para probar rápido puedes desactivar "Confirm email" en el proveedor Email.

## Desarrollo local
```
npx serve .
```

## Notas
- Al primer login, los datos que hubiera en `localStorage` (versión anterior) se importan a la cuenta.
- El catálogo se carga entero (hasta 1000 series) en el cliente. Cuando crezca, mover la búsqueda a servidor (`pg_trgm` ya está activo).
