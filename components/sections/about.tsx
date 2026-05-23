"use client";

import { ScrollReveal, SectionHeader } from "@/components/motion";
import { useLocale } from "@/components/providers/locale-provider";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { layout } from "@/lib/constants";

export function AboutSection() {
  const { t } = useLocale();

  return (
    <section id="about" className={`relative ${layout.section}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />

      <div className={layout.container}>
        <SectionHeader>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-emerald-500/90 sm:text-xs sm:tracking-[0.4em]">
            {t.about.label}
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-light leading-tight text-cream-50 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.about.title}{" "}
            <span className="text-emerald-400/90">{t.about.titleHighlight}</span>
          </h2>
        </SectionHeader>

        <div className="mt-10 grid gap-10 sm:mt-14 lg:mt-16 lg:grid-cols-[minmax(0,11rem)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,13rem)_1fr] xl:gap-16">
          <ScrollReveal
            preset="fromStart"
            className="flex justify-center lg:justify-start"
          >
            <ProfileAvatar alt={t.hero.profileAlt} size="about" />
          </ScrollReveal>

          <div className="min-w-0">
            <ScrollReveal preset="content" delay={0.1}>
              <div className="space-y-5 text-sm leading-relaxed text-cream-300/75 sm:text-base sm:leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
