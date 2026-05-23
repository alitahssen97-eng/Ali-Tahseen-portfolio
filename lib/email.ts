import { getAdminEmails } from "@/lib/auth/admin";
import { getSiteUrl } from "@/lib/seo/site-url";

export type ContactNotification = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type EmailNotifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "missing_resend_config"
        | "no_recipients"
        | "resend_rejected";
      detail?: string;
    };

function getNotifyRecipients(): string[] {
  const explicit = process.env.NOTIFY_EMAIL?.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (explicit?.length) return explicit;
  return getAdminEmails().map((e) => e.toLowerCase());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: ContactNotification): string {
  const adminUrl = `${getSiteUrl()}/admin/messages`;
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"></head>
<body style="font-family:Segoe UI,Tahoma,sans-serif;background:#0a0a0a;color:#f5f0e8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:8px;padding:28px">
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#34d399">رسالة جديدة — Portfolio</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:500;color:#faf8f5">${subject}</h1>
    <p style="margin:0 0 6px;color:#a8a29e;font-size:13px">من</p>
    <p style="margin:0 0 16px;color:#faf8f5">${name} &lt;<a href="mailto:${email}" style="color:#34d399">${email}</a>&gt;</p>
    <p style="margin:0 0 6px;color:#a8a29e;font-size:13px">الرسالة</p>
    <p style="margin:0 0 24px;line-height:1.6;color:#e7e5e4;white-space:pre-wrap">${message}</p>
    <a href="${adminUrl}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:4px;font-size:14px">عرض في لوحة التحكم</a>
  </div>
</body>
</html>`;
}

async function sendViaResend(
  to: string[],
  data: ContactNotification
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { ok: false, detail: "RESEND_API_KEY or EMAIL_FROM is empty" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `[Portfolio] رسالة جديدة: ${data.subject}`,
      html: buildHtml(data),
      reply_to: data.email,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend API error:", res.status, err);
    return { ok: false, detail: `HTTP ${res.status}: ${err}` };
  }

  return { ok: true };
}

/** Sends admin notification; never throws — contact form still succeeds if email fails. */
export async function notifyAdminNewMessage(
  data: ContactNotification
): Promise<EmailNotifyResult> {
  const recipients = getNotifyRecipients();
  if (recipients.length === 0) {
    console.warn(
      "[email] Skipped: set NOTIFY_EMAIL or ADMIN_EMAILS in environment variables."
    );
    return { ok: false, reason: "no_recipients" };
  }

  if (!process.env.RESEND_API_KEY?.trim() || !process.env.EMAIL_FROM?.trim()) {
    console.warn(
      "[email] Skipped: set RESEND_API_KEY and EMAIL_FROM (see .env.example)."
    );
    return { ok: false, reason: "missing_resend_config" };
  }

  try {
    const result = await sendViaResend(recipients, data);
    if (!result.ok) {
      console.error("[email] Failed to notify:", result.detail);
      console.error(
        "[email] Tip: verify a domain at resend.com/domains and use EMAIL_FROM like",
        '"Portfolio <notify@yourdomain.com>". For testing only: "Portfolio <onboarding@resend.dev>".'
      );
      return { ok: false, reason: "resend_rejected", detail: result.detail };
    }

    console.info("[email] Notification sent to:", recipients.join(", "));
    return { ok: true };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send admin notification:", detail);
    return { ok: false, reason: "resend_rejected", detail };
  }
}
