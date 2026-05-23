import { prisma } from "@/lib/prisma";
import { getCachedSiteContentBundle } from "@/lib/db/cached";
import { translations } from "@/lib/i18n/translations";
import { fetchContentOverrides } from "@/lib/db/queries/content";
import {
  flattenObject,
  unflattenObject,
  deepMerge,
  isLegacySectionBlob,
} from "@/lib/i18n/flatten";
import type { TranslationKeys } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/types";

export type { SiteContentBundle } from "@/lib/content/types";
import type { SiteContentBundle } from "@/lib/content/types";

export function getDefaultContentBundle(): SiteContentBundle {
  return {
    en: translations.en,
    ar: translations.ar,
  };
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  if (!process.env.DATABASE_URL) {
    return getDefaultContentBundle();
  }

  try {
    return await getCachedSiteContentBundle();
  } catch {
    return getDefaultContentBundle();
  }
}

export function getContentForLocale(
  bundle: SiteContentBundle,
  locale: Locale
): TranslationKeys {
  return bundle[locale];
}

/** Flat list of all editable keys with EN/AR values for admin */
export async function getEditableContentRows(): Promise<
  Array<{ key: string; en: string; ar: string; group: string }>
> {
  const defaults = getDefaultContentBundle();
  const flatEn = flattenObject(defaults.en as unknown as Record<string, unknown>);
  const flatAr = flattenObject(defaults.ar as unknown as Record<string, unknown>);

  let overrides: Record<Locale, Record<string, string>> = { en: {}, ar: {} };
  if (process.env.DATABASE_URL) {
    try {
      overrides = await fetchContentOverrides();
    } catch {
      // use defaults only
    }
  }

  const allKeys = new Set([
    ...Object.keys(flatEn),
    ...Object.keys(flatAr),
    ...Object.keys(overrides.en),
    ...Object.keys(overrides.ar),
  ]);

  return Array.from(allKeys)
    .filter((key) => {
      const en = overrides.en[key] ?? flatEn[key] ?? "";
      const ar = overrides.ar[key] ?? flatAr[key] ?? "";
      return !isLegacySectionBlob(key, en) && !isLegacySectionBlob(key, ar);
    })
    .sort()
    .map((key) => ({
      key,
      group: key.split(".")[0] ?? "general",
      en: overrides.en[key] ?? flatEn[key] ?? "",
      ar: overrides.ar[key] ?? flatAr[key] ?? "",
    }));
}

export async function saveContentRows(
  rows: Array<{ key: string; en: string; ar: string }>
) {
  const operations = rows.flatMap((row) => [
    prisma.contentBlock.upsert({
      where: { key_locale: { key: row.key, locale: "en" } },
      create: { key: row.key, locale: "en", value: row.en },
      update: { value: row.en },
    }),
    prisma.contentBlock.upsert({
      where: { key_locale: { key: row.key, locale: "ar" } },
      create: { key: row.key, locale: "ar", value: row.ar },
      update: { value: row.ar },
    }),
  ]);

  await prisma.$transaction(operations);
}
