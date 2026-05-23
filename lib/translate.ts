/** MyMemory limits each request to 500 characters; we chunk longer text. */
const MYMEMORY_MAX_CHARS = 480;

/** Split text into chunks <= maxChars, preferring sentence/paragraph boundaries. */
function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  // Split by paragraphs first, then sentences, then words as a last resort.
  const paragraphs = text.split(/(\n+)/);
  let buffer = "";

  const flushBuffer = () => {
    if (buffer.length > 0) {
      chunks.push(buffer);
      buffer = "";
    }
  };

  const pushPiece = (piece: string) => {
    if (piece.length === 0) return;
    if (buffer.length + piece.length <= maxChars) {
      buffer += piece;
      return;
    }
    flushBuffer();
    if (piece.length <= maxChars) {
      buffer = piece;
      return;
    }
    // Piece itself too long → split by sentences.
    const sentences = piece.split(/(?<=[.!?؟。…])\s+/);
    for (const sentence of sentences) {
      if (sentence.length <= maxChars) {
        if (buffer.length + sentence.length + 1 <= maxChars) {
          buffer += (buffer ? " " : "") + sentence;
        } else {
          flushBuffer();
          buffer = sentence;
        }
        continue;
      }
      // Sentence still too long → hard split by words.
      const words = sentence.split(/\s+/);
      for (const word of words) {
        const candidate = buffer ? `${buffer} ${word}` : word;
        if (candidate.length <= maxChars) {
          buffer = candidate;
        } else {
          flushBuffer();
          buffer = word.length <= maxChars ? word : word.slice(0, maxChars);
          if (word.length > maxChars) {
            // Pathological single token: hard slice the remainder too.
            let rest = word.slice(maxChars);
            while (rest.length > maxChars) {
              chunks.push(rest.slice(0, maxChars));
              rest = rest.slice(maxChars);
            }
            buffer = rest;
          }
        }
      }
    }
  };

  for (const part of paragraphs) {
    pushPiece(part);
  }
  flushBuffer();

  return chunks.filter((c) => c.length > 0);
}

async function translateChunk(
  text: string,
  source: "ar" | "en",
  target: "ar" | "en"
): Promise<string> {
  const langpair = `${source}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Translation service unavailable");

  const data = await res.json();
  const translated = data?.responseData?.translatedText as string | undefined;
  const status = data?.responseStatus as number | string | undefined;

  if (!translated || (status && Number(status) >= 400)) {
    const details =
      typeof data?.responseDetails === "string" ? data.responseDetails : "";
    throw new Error(details || "Translation failed");
  }

  return translated;
}

/** Free translation via MyMemory with automatic chunking for long inputs. */
export async function translateText(
  text: string,
  source: "ar" | "en",
  target: "ar" | "en"
): Promise<string> {
  if (!text.trim()) return "";
  if (source === target) return text;

  const chunks = chunkText(text, MYMEMORY_MAX_CHARS);
  const out: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const translated = await translateChunk(chunks[i], source, target);
    out.push(translated);
    if (i < chunks.length - 1) {
      // Small delay to be gentle with the free tier rate limits.
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  return out.join("");
}

/** Skip empty values and structured JSON (arrays/objects stored as strings). */
export function shouldSkipAutoTranslate(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function isArabicFieldTranslatable(ar: string): boolean {
  return Boolean(ar.trim()) && !shouldSkipAutoTranslate(ar);
}
