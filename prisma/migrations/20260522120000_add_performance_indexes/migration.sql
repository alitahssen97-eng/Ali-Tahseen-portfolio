-- Performance indexes for portfolio queries (idempotent)

CREATE INDEX IF NOT EXISTS "projects_published_featured_createdAt_idx"
  ON "projects" ("published", "featured" DESC, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "projects_published_idx"
  ON "projects" ("published");

CREATE INDEX IF NOT EXISTS "messages_status_idx"
  ON "messages" ("status");

CREATE INDEX IF NOT EXISTS "messages_createdAt_idx"
  ON "messages" ("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "content_blocks_locale_idx"
  ON "content_blocks" ("locale");
