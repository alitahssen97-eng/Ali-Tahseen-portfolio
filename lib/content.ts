import { prisma } from "@/lib/prisma";
import { flattenObject, unflattenObject, deepMerge } from "@/lib/i18n/flatten";
import { translations } from "@/lib/i18n/translations";
import type { TranslationKeys } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/types";

export type SiteContentBundle = Record<Locale, TranslationKeys>;

export function getDefaultContentBundle(): SiteContentBundle {
  return {
    en: translations.en,
    ar: translations.ar,
  };
}

async function getContentOverrides(): Promise<
  Record<Locale, Record<string, string>>
> {
  const empty: Record<Locale, Record<string, string>> = { en: {}, ar: {} };

  if (!process.env.DATABASE_URL) return empty;

  try {
    const blocks = await prisma.contentBlock.findMany();
    for (const block of blocks) {
      const locale = block.locale as Locale;
      if (locale !== "en" && locale !== "ar") continue;
      empty[locale][block.key] = block.value;
    }
    return empty;
  } catch {
    return empty;
  }
}

export async function getSiteContentBundle(): Promise<SiteContentBundle> {
  const defaults = getDefaultContentBundle();
  const overrides = await getContentOverrides();

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
  const overrides = await getContentOverrides();

  const allKeys = new Set([
    ...Object.keys(flatEn),
    ...Object.keys(flatAr),
    ...Object.keys(overrides.en),
    ...Object.keys(overrides.ar),
  ]);

  return Array.from(allKeys)
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
