# Security overview

## Authentication

- Admin UI: Supabase Auth session + `ADMIN_EMAILS` allowlist (middleware + `requireAdmin()` on every `/api/admin/*` route).
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is server-only — never expose in client bundles.

## Environment checklist

| Variable | Exposure | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | OK |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | OK (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Server only |
| `DATABASE_URL` | **Secret** | Server only |
| `RESEND_API_KEY` | **Secret** | Server only |
| `ADMIN_EMAILS` | Server | Comma-separated allowlist |

## Hardening in code

- Open redirect blocked on admin login (`lib/security/sanitize.ts`).
- Contact form rate limit (5 / 15 min per IP, in-memory).
- Upload magic-byte validation; SVG disabled.
- Security headers via `next.config.ts`.
- CMS keys filtered against prototype pollution.

## Recommended (operations)

1. Disable public sign-up in Supabase Auth unless required.
2. Enable Supabase RLS on all tables accessed via anon key.
3. Use Vercel WAF / Cloudflare rate limiting for `/api/contact` at scale.
4. Rotate `SUPABASE_SERVICE_ROLE_KEY` if ever leaked.
5. Run `npm audit` periodically.
