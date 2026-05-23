/** Shared contact form limits (client + API). */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 120 },
  email: { max: 254 },
  subject: { min: 3, max: 200 },
  message: { min: 10, max: 5000 },
} as const;

export type ContactFormPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
