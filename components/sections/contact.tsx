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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactSection() {
  const { t } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

  function clearStatus() {
    if (formState === "success" || formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current ?? e.currentTarget;
    setFormState("loading");
    setErrorMessage("");

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? t.contact.form.errorGeneric);
      }

      form.reset();
      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : t.contact.form.errorGeneric
      );
    }
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
              className="rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-5 backdrop-blur-md sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.contact.form.name}</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder={t.contact.form.namePlaceholder}
                    disabled={formState === "loading"}
                    onChange={clearStatus}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.contact.form.email}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t.contact.form.emailPlaceholder}
                    disabled={formState === "loading"}
                    onChange={clearStatus}
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <Label htmlFor="subject">{t.contact.form.subject}</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder={t.contact.form.subjectPlaceholder}
                  disabled={formState === "loading"}
                  onChange={clearStatus}
                />
              </div>
              <div className="mt-6 space-y-2">
                <Label htmlFor="message">{t.contact.form.message}</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder={t.contact.form.messagePlaceholder}
                  disabled={formState === "loading"}
                  onChange={clearStatus}
                />
              </div>

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
                      {t.contact.form.success}
                    </motion.p>
                  )}
                  {formState === "error" && (
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

              <Button
                type="submit"
                className="mt-6 w-full sm:w-auto"
                disabled={formState === "loading" || formState === "success"}
                variant={formState === "success" ? "outline" : "default"}
              >
                {formState === "loading" ? (
                  t.contact.form.sending
                ) : formState === "success" ? (
                  t.contact.form.success
                ) : (
                  <>
                    {t.contact.form.send}
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
