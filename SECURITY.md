# Security Policy

## Reporting a vulnerability
Please **do not** open a public issue. Use GitHub's private reporting: **Security → Report a vulnerability** on this repository. We'll acknowledge within a few days.

## Design notes
- The client ships only the Supabase **publishable** key, which is public by design. All data access is enforced by Postgres **Row Level Security** policies in `supabase/migrations/`.
- Never commit a `service_role` / secret key. `npm run check` rejects common patterns.
- If you self-host, enable RLS on every table you add and review the Supabase security advisors.
