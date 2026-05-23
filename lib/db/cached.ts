import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/db/tags";
import { fetchContentOverrides } from "@/lib/db/queries/content";
import { fetchPublishedProjects } from "@/lib/db/queries/projects";
import { fetchProfileImageUrl } from "@/lib/db/queries/settings";
import {
  deepMerge,
  unflattenObject,
} from "@/lib/i18n/flatten";
import { translations } from "@/lib/i18n/translations";
import type { TranslationKeys } from "@/lib/i18n/translations";
import type { SiteContentBundle } from "@/lib/content/types";
import type { Project } from "@prisma/client";

function getDefaultContentBundle(): SiteContentBundle {
  return {
    en: translations.en,
    ar: translations.ar,
  };
}

export const getCachedPublishedProjects = unstable_cache(
  async (): Promise<Project[]> => fetchPublishedProjects(),
  ["published-projects"],
  { tags: [CACHE_TAGS.projects], revalidate: CACHE_REVALIDATE_SECONDS }
);

export const getCachedProfileImageUrl = unstable_cache(
  async (): Promise<string> => fetchProfileImageUrl(),
  ["profile-image-url"],
  { tags: [CACHE_TAGS.settings], revalidate: CACHE_REVALIDATE_SECONDS }
);

export const getCachedSiteContentBundle = unstable_cache(
  async (): Promise<SiteContentBundle> => {
    const defaults = getDefaultContentBundle();
    const overrides = await fetchContentOverrides();

    return {
      en: deepMerge(
        defaults.en,
        unflattenObject(overrides.en) as Record<string, unknown>
      ) as TranslationKeys,
      ar: deepMerge(
        defaults.ar,
        unflattenObject(overrides.ar) as Record<string, unknown>
      ) as TranslationKeys,
    };
  },
  ["site-content-bundle"],
  { tags: [CACHE_TAGS.content], revalidate: CACHE_REVALIDATE_SECONDS }
);
