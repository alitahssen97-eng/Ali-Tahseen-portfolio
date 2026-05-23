import { existsSync, readFileSync } from "fs";
import path from "path";

/** Load .env then .env.local (Next.js order; local overrides). */
export function loadProjectEnv(): { loaded: string[] } {
  const root = process.cwd();
  const loaded: string[] = [];

  for (const file of [".env", ".env.local"]) {
    const filePath = path.join(root, file);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
    loaded.push(file);
  }

  return { loaded };
}
