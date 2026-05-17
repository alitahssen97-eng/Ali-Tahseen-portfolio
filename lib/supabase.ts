/**
 * @deprecated Prefer `@/utils/supabase/client` (browser) or `@/utils/supabase/server` (server).
 */
export { createClient } from "@/utils/supabase/client";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
