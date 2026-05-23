const BLOCKED_PATH_SEGMENTS = new Set(["..", "."]);

/** Safe internal redirect after admin login (prevents open redirect). */
export function sanitizeAdminRedirect(next: string | null | undefined): string {
  const fallback = "/admin";
  if (!next || typeof next !== "string") return fallback;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.includes("\\")) return fallback;
  if (!trimmed.startsWith("/admin")) return fallback;

  return trimmed;
}

/** Portfolio image paths: https URLs or /uploads/... only (no traversal). */
export function isSafePortfolioImageUrl(value: string): boolean {
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  if (!value.startsWith("/uploads/")) return false;
  const segments = value.split("/").filter(Boolean);
  return segments.every((seg) => !BLOCKED_PATH_SEGMENTS.has(seg));
}

/** Block prototype-pollution keys in CMS flat keys. */
export function isSafeContentKey(key: string): boolean {
  if (!key || key.includes("\0")) return false;
  const parts = key.split(".");
  return parts.every(
    (part) =>
      part.length > 0 &&
      part !== "__proto__" &&
      part !== "prototype" &&
      part !== "constructor"
  );
}
