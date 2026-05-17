import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { getEditableContentRows, saveContentRows } from "@/lib/content";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getEditableContentRows();
  return NextResponse.json({ rows });
}

const saveSchema = z.object({
  rows: z.array(
    z.object({
      key: z.string().min(1),
      en: z.string(),
      ar: z.string(),
    })
  ),
});

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await saveContentRows(parsed.data.rows);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
