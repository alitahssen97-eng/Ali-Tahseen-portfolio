import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  mapUploadError,
  uploadProfileLocally,
  uploadProfileToSupabase,
} from "@/lib/storage/portfolio";
import { updateProfileImageUrl } from "@/lib/site-settings";
import { isStorageAdminConfigured } from "@/utils/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file || type !== "profile") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Max file size 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());
    const payload = { buffer, ext, contentType: file.type };

    let publicUrl: string;

    if (isStorageAdminConfigured()) {
      publicUrl = await uploadProfileToSupabase(payload);
    } else if (process.env.NODE_ENV !== "production") {
      publicUrl = await uploadProfileLocally(payload);
    } else {
      return NextResponse.json(
        {
          error:
            "أضف SUPABASE_SERVICE_ROLE_KEY إلى .env (Supabase → Settings → API) لرفع الصور.",
        },
        { status: 503 }
      );
    }

    await updateProfileImageUrl(publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    const { status, message } = mapUploadError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
