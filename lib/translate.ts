/** Free translation via MyMemory (rate-limited; suitable for admin use) */
export async function translateText(
  text: string,
  source: "ar" | "en",
  target: "ar" | "en"
): Promise<string> {
  if (!text.trim()) return "";
  if (source === target) return text;

  const langpair = `${source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Translation service unavailable");

  const data = await res.json();
  const translated = data?.responseData?.translatedText as string | undefined;

  if (!translated) throw new Error("Translation failed");

  return translated;
}

export function shouldSkipAutoTranslate(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.startsWith("[") ||
    trimmed.startsWith("{") ||
    trimmed.length > 500
  );
}
