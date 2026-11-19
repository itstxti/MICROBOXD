<div align="center">

# Microboxd

**Un "Letterboxd" para microseries de IA: registra, puntúa, reseña y comparte lo que ves.**

[**Demo en vivo →**](https://microboxd.vercel.app) · [Changelog](CHANGELOG.md) · [Contribuir](CONTRIBUTING.md) · [English](README.md)

<img src="docs/demo.gif" alt="Demo de Microboxd" width="300">

</div>

PWA instalable para quien devora microseries verticales (DramaBox, ReelShort, ShortMax…): diario con medias estrellas, rewatches y reseñas con spoilers ocultos, listas, seguir a amigos y ver su actividad. Pensada para móvil, con diseño completo para escritorio.

**Sin build ni framework:** HTML, un CSS y archivos JS vanilla (`index.html`, `css/`, `js/`) sobre [Supabase](https://supabase.com) (Auth, Postgres con RLS, Storage).

## Inicio rápido (un comando)
```bash
npx degit itstxti/microboxd microboxd && npx serve microboxd
```
Abre http://localhost:3000. Por defecto usa el **backend público de demo compartido**. Para tu propio backend, sigue los pasos de abajo.

## Autoalojamiento
1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Aplica `supabase/migrations/0001…` hasta la última, **en orden** (editor SQL o `supabase db push`).
3. Apunta la app a tu proyecto (clave **publishable**, nunca una secreta):
   ```bash
   node scripts/setup.mjs https://<tu-ref>.supabase.co <clave-publishable>
   ```
4. Supabase → *Authentication → URL Configuration*: **Site URL** = tu dominio y añade `http://localhost:3000` a *Redirect URLs*. En producción configura un SMTP propio.
5. Sube la carpeta a cualquier hosting estático (Vercel, Netlify, GitHub Pages…).

## Desarrollo
`npm run dev` · `npm run check` (los mismos checks que la CI). Más en [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia
[MIT](LICENSE)
