# Database layer

## Layout

| Path | Role |
|------|------|
| `client.ts` | Prisma re-export + `isDatabaseConfigured()` |
| `tags.ts` | Next.js cache tag names |
| `revalidate.ts` | Call after admin writes to refresh the public site |
| `cached.ts` | `unstable_cache` wrappers (homepage + layout) |
| `queries/*.ts` | Raw Prisma queries (no caching) |

## Indexes (see `prisma/schema.prisma`)

- **projects**: `(published, featured DESC, createdAt DESC)` — homepage listing
- **projects**: `(published)` — admin counts
- **messages**: `(status)`, `(createdAt DESC)` — inbox filters
- **content_blocks**: `(locale)` — CMS overrides

Apply: `npm run db:migrate` or `npm run db:push`

## Cache invalidation

Admin APIs should call `revalidatePublicCache()` after mutations so visitors see fresh data without waiting for TTL.
