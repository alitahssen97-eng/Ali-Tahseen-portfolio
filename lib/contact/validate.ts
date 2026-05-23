import { CONTACT_LIMITS, type ContactFormPayload } from "@/lib/contact/limits";

export type ContactField = keyof ContactFormPayload;

export type ContactFormLabels = {
  nameTooShort: string;
  invalidEmail: string;
  subjectTooShort: string;
  messageEmpty: string;
  messageTooShort: string;
};

export type FieldErrors = Partial<Record<ContactField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export function validateContactForm(
  payload: ContactFormPayload,
  labels: ContactFormLabels
): FieldErrors {
  const errors: FieldErrors = {};
  const name = payload.name.trim();
  const email = payload.email.trim();
  const subject = payload.subject.trim();
  const message = payload.message.trim();

  if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = fill(labels.nameTooShort, {
      min: CONTACT_LIMITS.name.min,
    });
  }

  if (!email) {
    errors.email = labels.invalidEmail;
  } else if (!EMAIL_RE.test(email)) {
    errors.email = labels.invalidEmail;
  }

  if (subject.length < CONTACT_LIMITS.subject.min) {
    errors.subject = fill(labels.subjectTooShort, {
      min: CONTACT_LIMITS.subject.min,
    });
  }

  if (message.length === 0) {
    errors.message = labels.messageEmpty;
  } else if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = fill(labels.messageTooShort, {
      min: CONTACT_LIMITS.message.min,
      remaining: CONTACT_LIMITS.message.min - message.length,
    });
  }

  return errors;
}

export function trimContactPayload(
  payload: ContactFormPayload
): ContactFormPayload {
  return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    subject: payload.subject.trim(),
    message: payload.message.trim(),
  };
}
