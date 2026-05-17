import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyAdminNewMessage } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Set DATABASE_URL in your environment.",
        },
        { status: 503 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    await prisma.message.create({
      data: { name, email, subject, message },
    });

    void notifyAdminNewMessage({ name, email, subject, message });

    return NextResponse.json(
      { success: true, message: "Message received" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to save message. Please try again later." },
      { status: 500 }
    );
  }
}
