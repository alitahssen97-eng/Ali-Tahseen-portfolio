/** Next.js cache tags — invalidate via `revalidateTag` after admin writes. */
export const CACHE_TAGS = {
  projects: "db:projects",
  content: "db:content",
  settings: "db:settings",
} as const;

/** Default ISR / unstable_cache TTL (seconds). */
export const CACHE_REVALIDATE_SECONDS = 300;
