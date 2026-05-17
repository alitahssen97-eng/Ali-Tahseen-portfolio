"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { useLocale } from "@/components/providers/locale-provider";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { layout } from "@/lib/constants";

export function AboutSection() {
  const { t } = useLocale();

  return (
    <section id="about" className={`relative ${layout.section}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />

      <div className={layout.container}>
        <FadeIn>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-emerald-500/90 sm:text-xs sm:tracking-[0.4em]">
            {t.about.label}
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-light leading-tight text-cream-50 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.about.title}{" "}
            <span className="text-emerald-400/90">{t.about.titleHighlight}</span>
          </h2>
        </FadeIn>

        <div className="mt-10 grid gap-10 sm:mt-14 lg:mt-16 lg:grid-cols-[minmax(0,11rem)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,13rem)_1fr] xl:gap-16">
          <FadeIn delay={0.05} className="flex justify-center lg:justify-start">
            <ProfileAvatar alt={t.hero.profileAlt} size="about" />
          </FadeIn>

          <div className="min-w-0 space-y-8 sm:space-y-10">
            <FadeIn delay={0.1}>
              <div className="space-y-5 text-sm leading-relaxed text-cream-300/75 sm:text-base sm:leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
                <p>{t.about.p3}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-6 border-t border-neutral-800/80 pt-8 sm:grid-cols-3 sm:gap-8 sm:pt-10">
                {t.about.stats.map((stat) => (
                  <div key={stat.label} className="min-w-0">
                    <p className="font-display text-2xl text-emerald-400 sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase leading-snug tracking-[0.12em] text-cream-400/50 sm:text-xs sm:tracking-[0.15em]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
