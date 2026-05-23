const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Magic-byte sniffing — do not trust client Content-Type alone. */
export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function validateImageUpload(
  buffer: Buffer
): { ok: true; mime: string } | { ok: false; message: string } {
  const detected = detectImageMime(buffer);
  if (!detected || !ALLOWED_MIME.has(detected)) {
    return {
      ok: false,
      message: "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP أو GIF.",
    };
  }

  return { ok: true, mime: detected };
}
