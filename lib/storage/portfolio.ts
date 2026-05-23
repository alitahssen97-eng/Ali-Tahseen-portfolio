import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAdminClient,
  isStorageAdminConfigured,
} from "@/utils/supabase/admin";

export const PORTFOLIO_BUCKET = "portfolio";
const MAX_SIZE = 5 * 1024 * 1024;

export type ImageUploadInput = {
  buffer: Buffer;
  ext: string;
  contentType: string;
};

export type UploadFolder = "profile" | "projects";

function sanitizeExt(ext: string): string {
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned || "jpg";
}

export async function ensurePortfolioBucket(
  supabase: SupabaseClient
): Promise<void> {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  if (buckets?.some((b) => b.name === PORTFOLIO_BUCKET)) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    PORTFOLIO_BUCKET,
    {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
    }
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
}

export async function uploadImageToSupabase(
  { buffer, ext, contentType }: ImageUploadInput,
  folder: UploadFolder
): Promise<string> {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("MISSING_SERVICE_ROLE");
  }

  await ensurePortfolioBucket(supabase);

  const safeExt = sanitizeExt(ext);
  const prefix = folder === "profile" ? "ali-profile" : "project";
  const objectPath = `${folder}/${prefix}-${Date.now()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(objectPath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PORTFOLIO_BUCKET).getPublicUrl(objectPath);

  return publicUrl;
}

/** Dev fallback when service role is not configured (local `npm run dev` only). */
export async function uploadImageLocally(
  { buffer, ext }: ImageUploadInput,
  folder: UploadFolder
): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("LOCAL_UPLOAD_DISABLED");
  }

  const safeExt = sanitizeExt(ext);
  const prefix = folder === "profile" ? "ali-profile" : "project";
  const filename = `${prefix}-${Date.now()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function uploadPortfolioImage(
  input: ImageUploadInput,
  folder: UploadFolder
): Promise<string> {
  if (isStorageAdminConfigured()) {
    return uploadImageToSupabase(input, folder);
  }

  if (process.env.NODE_ENV !== "production") {
    return uploadImageLocally(input, folder);
  }

  throw new Error("MISSING_SERVICE_ROLE");
}

/** @deprecated Use uploadPortfolioImage(input, "profile") */
export const uploadProfileToSupabase = (input: ImageUploadInput) =>
  uploadImageToSupabase(input, "profile");

/** @deprecated Use uploadImageLocally(input, "profile") */
export const uploadProfileLocally = (input: ImageUploadInput) =>
  uploadImageLocally(input, "profile");

export function mapUploadError(error: unknown): {
  status: number;
  message: string;
} {
  if (error instanceof Error && error.message === "MISSING_SERVICE_ROLE") {
    return {
      status: 503,
      message:
        "أضف SUPABASE_SERVICE_ROLE_KEY إلى ملف .env (من Supabase → Settings → API → service_role) ثم أعد تشغيل السيرفر.",
    };
  }

  if (error instanceof Error && error.message === "LOCAL_UPLOAD_DISABLED") {
    return {
      status: 503,
      message:
        "أضف SUPABASE_SERVICE_ROLE_KEY إلى .env لرفع الصور في بيئة الإنتاج.",
    };
  }

  const storage = error as { message?: string; statusCode?: string };
  const msg = storage.message ?? "";

  if (/Bucket not found/i.test(msg)) {
    return {
      status: 500,
      message:
        "حاوية التخزين غير موجودة. أضف SUPABASE_SERVICE_ROLE_KEY لإنشائها تلقائياً، أو أنشئ bucket باسم portfolio يدوياً في Supabase Storage.",
    };
  }

  if (/row-level security|policy/i.test(msg)) {
    return {
      status: 500,
      message:
        "صلاحيات التخزين غير كافية. استخدم SUPABASE_SERVICE_ROLE_KEY في .env للرفع من لوحة التحكم.",
    };
  }

  return {
    status: 500,
    message: msg || "فشل رفع الصورة. حاول مرة أخرى.",
  };
}
