import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { getProfileImageUrl, updateProfileImageUrl } from "@/lib/site-settings";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileImageUrl = await getProfileImageUrl();
  return NextResponse.json({ profileImageUrl });
}

const schema = z.object({
  profileImageUrl: z.string().min(1),
});

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    await updateProfileImageUrl(parsed.data.profileImageUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
