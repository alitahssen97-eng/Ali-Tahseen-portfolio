export function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) continue;

    if (typeof value === "object") {
      result[path] = JSON.stringify(value);
    } else {
      result[path] = String(value);
    }
  }

  return result;
}

export function unflattenObject(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [path, raw] of Object.entries(flat)) {
    const keys = path.split(".");
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== "object" || current[k] === null) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }

    const last = keys[keys.length - 1];
    if (raw.startsWith("[") || raw.startsWith("{")) {
      try {
        current[last] = JSON.parse(raw);
        continue;
      } catch {
        // fall through to string
      }
    }
    current[last] = raw;
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
  const output = { ...base } as Record<string, unknown>;

  for (const [key, value] of Object.entries(override)) {
    const baseVal = output[key];
    if (isPlainObject(baseVal) && isPlainObject(value)) {
      output[key] = deepMerge(baseVal, value);
    } else {
      output[key] = value;
    }
  }

  return output as T;
}
