import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { translateText } from "@/lib/translate";

const schema = z.object({
  text: z.string().max(20_000),
  source: z.enum(["ar", "en"]),
  target: z.enum(["ar", "en"]),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { text, source, target } = parsed.data;
    const translated = await translateText(text, source, target);

    return NextResponse.json({ translated });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "فشلت الترجمة. حاول مرة أخرى لاحقاً." },
      { status: 500 }
    );
  }
}
