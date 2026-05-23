import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  mapUploadError,
  uploadPortfolioImage,
  type UploadFolder,
} from "@/lib/storage/portfolio";
import { updateProfileImageUrl } from "@/lib/site-settings";
import { validateImageUpload } from "@/lib/security/upload";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const UPLOAD_TYPES: Record<string, UploadFolder> = {
  profile: "profile",
  project: "projects",
};

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const folder = type ? UPLOAD_TYPES[type] : undefined;

    if (!file || !folder) {
      return NextResponse.json(
        { error: "لم يُرسل ملف أو نوع الرفع غير صالح" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "الحد الأقصى لحجم الصورة 5MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const validated = validateImageUpload(buffer);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.message }, { status: 400 });
    }

    const ext = validated.mime.split("/")[1] ?? "jpg";
    const publicUrl = await uploadPortfolioImage(
      { buffer, ext, contentType: validated.mime },
      folder
    );

    if (type === "profile") {
      await updateProfileImageUrl(publicUrl);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    const { status, message } = mapUploadError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
