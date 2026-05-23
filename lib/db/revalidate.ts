import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/db/tags";

/** Bust public caches after admin mutations (projects, content, profile). */
/** Next.js 16+ requires a cache profile as the second argument. */
const REVALIDATE_PROFILE = "max" as const;

export function revalidatePublicCache() {
  revalidateTag(CACHE_TAGS.projects, REVALIDATE_PROFILE);
  revalidateTag(CACHE_TAGS.content, REVALIDATE_PROFILE);
  revalidateTag(CACHE_TAGS.settings, REVALIDATE_PROFILE);
  revalidatePath("/");
}
