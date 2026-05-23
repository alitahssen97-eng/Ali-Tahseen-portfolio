/**
 * One-time: upload local public/uploads/* to Supabase Storage and fix DB URLs.
 *
 * Requires in .env or .env.local:
 *   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run migrate:uploads
 */

import { loadProjectEnv } from "./load-env";

loadProjectEnv();

import { readdir, readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  uploadImageToSupabase,
  type UploadFolder,
} from "../lib/storage/portfolio";
import { detectImageMime } from "../lib/security/upload";

const prisma = new PrismaClient();
const uploadsRoot = path.join(process.cwd(), "public", "uploads");

async function filesIn(dir: string): Promise<string[]> {
  try {
    const names = await readdir(dir);
    return names
      .filter((n) => !n.startsWith("."))
      .map((n) => path.join(dir, n));
  } catch {
    return [];
  }
}

async function uploadLocalFile(
  absolutePath: string,
  folder: UploadFolder
): Promise<string> {
  const buffer = await readFile(absolutePath);
  const detected = detectImageMime(buffer);
  if (!detected) {
    throw new Error(`Unsupported image: ${absolutePath}`);
  }
  const ext = detected.split("/")[1] ?? "jpg";
  return uploadImageToSupabase(
    { buffer, ext, contentType: detected },
    folder
  );
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`\nMissing ${name}.`);
    console.error("Add it to .env or .env.local (see .env.example).");
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard → Project Settings → API → service_role (secret)\n"
    );
    process.exit(1);
  }
  return value;
}

async function main() {
  requireEnv("DATABASE_URL");
  requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const urlMap = new Map<string, string>();

  for (const folder of ["profile", "projects"] as const) {
    const dir = path.join(uploadsRoot, folder);
    const files = await filesIn(dir);
    for (const filePath of files) {
      const localUrl = `/uploads/${folder}/${path.basename(filePath)}`;
      console.log(`Uploading ${localUrl}...`);
      const publicUrl = await uploadLocalFile(filePath, folder);
      urlMap.set(localUrl, publicUrl);
      console.log(`  → ${publicUrl}`);
    }
  }

  const settings = await prisma.siteSetting.findUnique({
    where: { id: "singleton" },
  });
  if (settings?.profileImageUrl?.startsWith("/uploads/")) {
    const next = urlMap.get(settings.profileImageUrl);
    if (next) {
      await prisma.siteSetting.update({
        where: { id: "singleton" },
        data: { profileImageUrl: next },
      });
      console.log("Updated profile image URL in database.");
    }
  }

  const projects = await prisma.project.findMany({
    where: { imageUrl: { startsWith: "/uploads/" } },
  });

  for (const project of projects) {
    const next = urlMap.get(project.imageUrl);
    if (next) {
      await prisma.project.update({
        where: { id: project.id },
        data: { imageUrl: next },
      });
      console.log(`Updated project "${project.title}" image URL.`);
    } else {
      console.warn(`No local file for: ${project.imageUrl}`);
    }
  }

  console.log("\nDone. Redeploy or revalidate Vercel if needed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
