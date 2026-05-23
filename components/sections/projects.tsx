"use client";

import type { Project } from "@prisma/client";
import { ScrollReveal, SectionHeader } from "@/components/motion";
import { ImmersiveProjectsCarousel } from "@/components/sections/immersive-projects";
import { useLocale } from "@/components/providers/locale-provider";
import { layout } from "@/lib/constants";

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { t, locale } = useLocale();

  function pickDescription(p: Project) {
    if (locale === "ar" && p.descriptionAr && p.descriptionAr.trim()) {
      return p.descriptionAr;
    }
    return p.description;
  }

  return (
    <section id="projects" className={`relative ${layout.section}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />

      <div className={layout.container}>
        <SectionHeader>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-500/90">
            {t.projects.label}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-light text-cream-50 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.projects.title}
          </h2>
          <p className="mt-4 max-w-xl text-cream-300/60">
            {t.projects.subtitle}
          </p>
        </SectionHeader>

        {projects.length === 0 ? (
          <ScrollReveal preset="content" delay={0.1} className="mt-12">
            <div className="rounded-lg border border-dashed border-neutral-800 bg-neutral-950/40 p-10 text-center text-cream-400/60">
              {t.projects.empty}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal preset="media" className="mt-12 w-full min-w-0 overflow-x-clip sm:mt-14">
            <ImmersiveProjectsCarousel
              projects={projects}
              pickDescription={pickDescription}
              labels={{
                featured: t.projects.featured,
                viewProject: t.projects.viewProject,
                githubRepo: t.projects.githubRepo,
                showMore: t.projects.showMore,
                showLess: t.projects.showLess,
              }}
              prevLabel={
                locale === "ar" ? "المشروع السابق" : "Previous project"
              }
              nextLabel={locale === "ar" ? "المشروع التالي" : "Next project"}
            />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
