import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_LIMITS } from "@/lib/contact/limits";
import { notifyAdminNewMessage } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const { name, subject, message, email } = CONTACT_LIMITS;

const contactSchema = z.object({
  name: z.string().trim().min(name.min).max(name.max),
  email: z.string().trim().email().max(email.max),
  subject: z.string().trim().min(subject.min).max(subject.max),
  message: z.string().trim().min(message.min).max(message.max),
});

const ERROR_MESSAGES: Record<string, string> = {
  name: `Name must be at least ${name.min} characters.`,
  email: "Please enter a valid email address.",
  subject: `Subject must be at least ${subject.min} characters.`,
  message: `Message must be at least ${message.min} characters.`,
};

function validationErrorMessage(
  issues: z.ZodIssue[]
): string {
  const first = issues[0];
  if (!first) return "Invalid input";

  const field = first.path[0];
  if (field === "name") return ERROR_MESSAGES.name;
  if (field === "email") return ERROR_MESSAGES.email;
  if (field === "subject") return ERROR_MESSAGES.subject;
  if (field === "message") return ERROR_MESSAGES.message;

  return first.message;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: limit.retryAfterSec
            ? { "Retry-After": String(limit.retryAfterSec) }
            : undefined,
        }
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: validationErrorMessage(parsed.error.issues),
        },
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

    const { name: senderName, email: senderEmail, subject: msgSubject, message: msgBody } =
      parsed.data;

    await prisma.message.create({
      data: {
        name: senderName,
        email: senderEmail,
        subject: msgSubject,
        message: msgBody,
      },
    });

    const emailResult = await notifyAdminNewMessage({
      name: senderName,
      email: senderEmail,
      subject: msgSubject,
      message: msgBody,
    });
    if (!emailResult.ok && process.env.NODE_ENV === "development") {
      console.warn("[contact] Email notification failed:", emailResult);
    }

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
