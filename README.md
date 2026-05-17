# Eng. Ali Tahseen — Luxury Portfolio

Ultra-premium personal portfolio built with Next.js 16 (App Router), React 19, TypeScript, Prisma, Supabase, Shadcn UI, Tailwind CSS v4, and Framer Motion.

## Architecture

```
ali/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Home (server component, fetches projects)
│   ├── globals.css         # Luxury theme tokens
│   └── api/contact/        # POST contact form → Prisma Message
├── components/
│   ├── ui/                 # Shadcn-style primitives (Button, Card, Input…)
│   ├── layout/             # Navbar, Footer
│   ├── sections/           # Hero, About, Projects, Contact
│   └── motion/             # FadeIn animation wrapper
├── lib/
│   ├── prisma.ts           # Prisma singleton
│   ├── supabase.ts         # Supabase JS client
│   ├── projects.ts         # getProjects() with DB + fallback
│   ├── constants.ts        # Site config & social links
│   └── data/sample-projects.ts
├── hooks/
│   └── use-in-view.ts      # Intersection observer for scroll animations
└── prisma/
    ├── schema.prisma       # Project + Message models
    └── seed.ts             # Sample portfolio data
```

### Data flow

1. **Projects** — `page.tsx` calls `getProjects()` → Prisma queries `Project` table. Falls back to sample data if `DATABASE_URL` is unset.
2. **Contact** — Client form POSTs to `/api/contact` → Zod validation → Prisma creates `Message` row.
3. **Supabase** — Client configured in `lib/supabase.ts` for future auth/storage; database uses Supabase Postgres via Prisma.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Add your Supabase Postgres URLs and keys to .env

# 4. Push schema & seed sample projects
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Pooled Postgres connection (Supabase, port 6543) |
| `DIRECT_URL` | Direct Postgres connection for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:seed` | Seed sample projects |
| `npm run db:studio` | Open Prisma Studio |

## Design system

- **Background:** `#080808` deep charcoal
- **Accent:** Emerald (`#10b981`)
- **Text:** Cream/beige (`#f5f0e8`)
- **Typography:** Cormorant Garamond (display) + DM Sans (body)
