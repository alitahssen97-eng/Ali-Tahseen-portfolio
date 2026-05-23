"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Mail, MessageCircle, Send } from "lucide-react";
import {
  ScrollReveal,
  ScrollRevealStagger,
  SectionHeader,
} from "@/components/motion";
import { useLocale } from "@/components/providers/locale-provider";
import { layout, siteConfig } from "@/lib/constants";
import { CONTACT_LIMITS } from "@/lib/contact/limits";
import {
  type ContactField,
  type FieldErrors,
  trimContactPayload,
  validateContactForm,
} from "@/lib/contact/validate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  );
}

export function ContactSection() {
  const { t } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [messageLength, setMessageLength] = useState(0);

  const f = t.contact.form;
  const { message: msgLimits } = CONTACT_LIMITS;

  const channels = [
    {
      key: "email" as const,
      href: `mailto:${siteConfig.email}`,
      icon: Mail,
      value: siteConfig.email,
      external: false,
    },
    {
      key: "instagram" as const,
      href: siteConfig.instagram.url,
      icon: Instagram,
      value: `@${siteConfig.instagram.handle}`,
      external: true,
    },
    {
      key: "whatsapp" as const,
      href: siteConfig.whatsapp.url,
      icon: MessageCircle,
      value: siteConfig.whatsapp.display,
      external: true,
    },
  ];

  const messageHint = fill(f.messageHint, {
    min: msgLimits.min,
    max: msgLimits.max,
  });

  const messageCounter = fill(f.messageCounter, {
    current: messageLength,
    max: msgLimits.max,
  });

  const messageRemaining =
    messageLength > 0 && messageLength < msgLimits.min
      ? fill(f.messageRemaining, {
          remaining: msgLimits.min - messageLength,
        })
      : null;

  const messageReady = messageLength >= msgLimits.min;

  function clearStatus() {
    if (formState === "success" || formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
  }

  function clearFieldError(field: ContactField) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessageLength(e.target.value.length);
    clearFieldError("message");
    clearStatus();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current ?? e.currentTarget;
    setErrorMessage("");

    const raw = {
      name: (formDataGet(form, "name") ?? "") as string,
      email: (formDataGet(form, "email") ?? "") as string,
      subject: (formDataGet(form, "subject") ?? "") as string,
      message: (formDataGet(form, "message") ?? "") as string,
    };

    const payload = trimContactPayload(raw);
    const errors = validateContactForm(payload, {
      nameTooShort: f.nameTooShort,
      invalidEmail: f.invalidEmail,
      subjectTooShort: f.subjectTooShort,
      messageEmpty: f.messageEmpty,
      messageTooShort: f.messageTooShort,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("");
      setFormState("idle");
      return;
    }

    setFieldErrors({});
    setFormState("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? f.errorGeneric);
      }

      form.reset();
      setMessageLength(0);
      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : f.errorGeneric
      );
    }
  }

  function resetForm() {
    formRef.current?.reset();
    setMessageLength(0);
    setFieldErrors({});
    setErrorMessage("");
    setFormState("idle");
  }

  return (
    <section id="contact" className={`relative ${layout.section}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 start-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-950/20 blur-[120px] rtl:translate-x-1/2" />

      <div className={`relative ${layout.container}`}>
        <SectionHeader>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-500/90">
            {t.contact.label}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-light text-cream-50 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.contact.title}
          </h2>
        </SectionHeader>

        <div className="mt-10 grid gap-10 sm:mt-14 sm:gap-12 lg:mt-16 lg:grid-cols-5 lg:gap-16">
          <ScrollReveal preset="fromStart" className="lg:col-span-2" delay={0.05}>
            <div className="space-y-6">
              <p className="leading-relaxed text-cream-300/70">
                {t.contact.intro}
              </p>
              <ScrollRevealStagger as="ul" className="space-y-4" stagger={0.12}>
                {channels.map(({ key, href, icon: Icon, value, external }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="group flex items-start gap-4 rounded-lg border border-transparent p-3 transition-all hover:border-neutral-800 hover:bg-neutral-950/50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950/80 text-emerald-500 transition-colors group-hover:border-emerald-800/50">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-[0.2em] text-cream-400/50">
                          {t.contact.channels[key]}
                        </span>
                        <span className="mt-0.5 block break-all text-sm text-cream-200 transition-colors group-hover:text-emerald-300 sm:break-normal">
                          {value}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ScrollRevealStagger>
            </div>
          </ScrollReveal>

          <ScrollReveal preset="fromEnd" className="lg:col-span-3" delay={0.15}>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-5 backdrop-blur-md sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  id="name"
                  label={f.name}
                  error={fieldErrors.name}
                >
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder={f.namePlaceholder}
                    disabled={formState === "loading"}
                    aria-invalid={Boolean(fieldErrors.name)}
                    onChange={() => {
                      clearFieldError("name");
                      clearStatus();
                    }}
                    className={fieldErrors.name ? "border-red-800/60" : undefined}
                  />
                </Field>
                <Field
                  id="email"
                  label={f.email}
                  error={fieldErrors.email}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={f.emailPlaceholder}
                    disabled={formState === "loading"}
                    aria-invalid={Boolean(fieldErrors.email)}
                    onChange={() => {
                      clearFieldError("email");
                      clearStatus();
                    }}
                    className={fieldErrors.email ? "border-red-800/60" : undefined}
                  />
                </Field>
              </div>

              <Field
                id="subject"
                label={f.subject}
                error={fieldErrors.subject}
                className="mt-6"
              >
                <Input
                  id="subject"
                  name="subject"
                  placeholder={f.subjectPlaceholder}
                  disabled={formState === "loading"}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  onChange={() => {
                    clearFieldError("subject");
                    clearStatus();
                  }}
                  className={fieldErrors.subject ? "border-red-800/60" : undefined}
                />
              </Field>

              <Field
                id="message"
                label={f.message}
                hint={messageHint}
                error={fieldErrors.message}
                className="mt-6"
              >
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  maxLength={msgLimits.max}
                  placeholder={f.messagePlaceholder}
                  disabled={formState === "loading"}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby="message-meta"
                  onChange={handleMessageChange}
                  className={cn(
                    "min-h-[120px] resize-y",
                    fieldErrors.message && "border-red-800/60"
                  )}
                />
                <div
                  id="message-meta"
                  className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"
                >
                  <span
                    className={cn(
                      messageRemaining
                        ? "text-amber-400/90"
                        : messageReady
                          ? "text-emerald-400/80"
                          : "text-cream-400/45"
                    )}
                  >
                    {messageRemaining ?? "\u00a0"}
                  </span>
                  <span
                    className={cn(
                      "tabular-nums",
                      messageLength > msgLimits.max * 0.9
                        ? "text-amber-400/90"
                        : "text-cream-400/50"
                    )}
                  >
                    {messageCounter}
                  </span>
                </div>
              </Field>

              <div
                className="mt-4 min-h-[1.25rem]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <AnimatePresence mode="wait">
                  {formState === "success" && (
                    <motion.p
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="rounded-sm border border-emerald-800/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300"
                    >
                      {f.success}
                    </motion.p>
                  )}
                  {formState === "error" &&
                    errorMessage &&
                    Object.keys(fieldErrors).length === 0 && (
                      <motion.p
                        key="error"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="rounded-sm border border-red-900/40 bg-red-950/20 px-3 py-2 text-sm text-red-400"
                      >
                        {errorMessage}
                      </motion.p>
                    )}
                </AnimatePresence>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={formState === "loading"}
                >
                  {formState === "loading" ? (
                    f.sending
                  ) : (
                    <>
                      {f.send}
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
                {formState === "success" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetForm}
                  >
                    {f.sendAnother}
                  </Button>
                )}
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function formDataGet(form: HTMLFormElement, name: string): string {
  return (new FormData(form).get(name) as string | null) ?? "";
}

function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {hint && !error && (
        <p className="text-xs text-cream-400/50">{hint}</p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
