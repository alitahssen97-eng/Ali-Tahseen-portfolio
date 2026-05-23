import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidatePublicCache } from "@/lib/db/revalidate";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { getAllProjects } from "@/lib/projects";
import { isSafePortfolioImageUrl } from "@/lib/security/sanitize";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await getAllProjects();
  return NextResponse.json({ projects });
}

const optionalUrl = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.union([z.string().url(), z.null()]).optional()
);

/** Accepts absolute URLs (http/https) or local upload paths (/uploads/...). */
const imagePath = z
  .string()
  .min(1, "صورة المشروع مطلوبة")
  .refine(isSafePortfolioImageUrl, "رابط الصورة غير صالح");

const optionalText = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? null : val),
  z.union([z.string(), z.null()]).optional()
);

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: optionalText,
  imageUrl: imagePath,
  liveLink: optionalUrl,
  githubLink: optionalUrl,
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({ data: parsed.data });
    revalidatePublicCache();
    revalidatePath("/admin/projects");
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
