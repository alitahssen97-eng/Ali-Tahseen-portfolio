import { isDatabaseConfigured, prisma } from "@/lib/db/client";
import type { Locale } from "@/lib/i18n/types";

const SUPPORTED_LOCALES: Locale[] = ["en", "ar"];

/** CMS overrides keyed by locale → translation path → value. */
export async function fetchContentOverrides(): Promise<
  Record<Locale, Record<string, string>>
> {
  const empty: Record<Locale, Record<string, string>> = { en: {}, ar: {} };
  if (!isDatabaseConfigured()) return empty;

  const blocks = await prisma.contentBlock.findMany({
    where: { locale: { in: SUPPORTED_LOCALES } },
    select: { key: true, locale: true, value: true },
  });

  for (const block of blocks) {
    const locale = block.locale as Locale;
    if (locale !== "en" && locale !== "ar") continue;
    empty[locale][block.key] = block.value;
  }

  return empty;
}
