"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, Instagram, MessageCircle } from "lucide-react";
import { layout, siteConfig } from "@/lib/constants";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlasmaLazy from "@/components/plasma/PlasmaLazy";

export function HeroSection() {
  const { t } = useLocale();

  const socials = [
    {
      href: siteConfig.instagram.url,
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: siteConfig.whatsapp.url,
      icon: MessageCircle,
      label: "WhatsApp",
    },
  ];

  return (
    <section
      className={`relative flex min-h-[100dvh] w-full min-w-0 items-center justify-center overflow-x-clip overflow-y-hidden ${layout.navbarOffset}`}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <PlasmaLazy
          color="#10b981"
          speed={1.1}
          direction="forward"
          scale={0.8}
          opacity={0.55}
          mouseInteractive
          className="absolute inset-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#080808_75%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,240,232,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,232,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </motion.div>

      <div
        className={`relative z-10 flex w-full min-w-0 flex-col items-center text-center ${layout.container}`}
      >
        <ProfileAvatar alt={t.hero.profileAlt} className="mb-6 sm:mb-8" />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 text-[10px] font-medium uppercase tracking-[0.35em] text-emerald-500/90 sm:mb-6 sm:text-xs sm:tracking-[0.4em]"
        >
          {t.hero.badge}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[min(100%,20rem)] font-display text-[clamp(1.75rem,8vw,2.5rem)] font-light leading-[1.08] tracking-tight text-cream-50 sm:max-w-none sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
        >
          {t.hero.nameLine1}
          <br />
          <span className="bg-gradient-to-r from-cream-100 via-emerald-200/90 to-emerald-500 bg-clip-text text-transparent">
            {t.hero.nameLine2}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mx-auto mt-6 max-w-2xl px-1 text-base leading-relaxed text-cream-300/70 sm:mt-8 sm:text-lg md:text-xl"
        >
          {t.hero.punchline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="#projects">{t.hero.viewWork}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="#contact">{t.hero.startConversation}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-10 flex items-center justify-center gap-3 sm:mt-14 sm:gap-4"
        >
          <TooltipProvider delayDuration={200}>
            {socials.map(({ href, icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950/50 text-cream-300/70 backdrop-blur-sm transition-all duration-300 hover:border-emerald-800/60 hover:text-emerald-400"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 start-1/2 z-10 -translate-x-1/2 text-cream-400/40 transition-colors hover:text-emerald-400 sm:bottom-10 rtl:translate-x-1/2"
        aria-label={t.hero.scrollToAbout}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.div>
      </motion.a>
    </section>
  );
}
