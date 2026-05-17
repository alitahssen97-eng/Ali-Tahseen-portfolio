"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import type { Project } from "@prisma/client";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { layout } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { t } = useLocale();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className={`relative ${layout.section}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-800/40 to-transparent" />

      <div className={layout.container}>
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-500/90">
            {t.projects.label}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-light text-cream-50 sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.projects.title}
          </h2>
          <p className="mt-4 max-w-xl text-cream-300/60">
            {t.projects.subtitle}
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-2">
          {featured.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              large={index === 0 && featured.length <= 2}
              labels={t.projects}
            />
          ))}
        </div>

        {rest.length > 0 && (
          <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                labels={t.projects}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  className,
  large = false,
  labels,
}: {
  project: Project;
  className?: string;
  large?: boolean;
  labels?: {
    featured: string;
    viewProject: string;
    githubRepo: string;
  };
}) {
  const primaryLink = project.liveLink ?? project.githubLink;
  const L = labels ?? {
    featured: "Featured",
    viewProject: "View Project",
    githubRepo: "GitHub repository",
  };

  return (
    <FadeIn className={className}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-neutral-800/80 bg-neutral-950/50 backdrop-blur-md"
      >
        <div
          className={cn(
            "relative overflow-hidden",
            large ? "aspect-[4/3]" : "aspect-video"
          )}
        >
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
          {project.featured && (
            <span className="absolute start-4 top-4 rounded-sm border border-emerald-800/50 bg-emerald-950/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-sm">
              {L.featured}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <h3 className="font-display text-xl text-cream-50 transition-colors group-hover:text-emerald-300">
            {project.title}
          </h3>
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed text-cream-300/65",
              large ? "line-clamp-4" : "line-clamp-2"
            )}
          >
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-3 pt-6">
            {primaryLink && (
              <Button asChild variant="ghost" size="sm" className="px-0">
                <Link
                  href={primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {L.viewProject}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
            {project.githubLink && (
              <Button asChild variant="ghost" size="sm" className="px-2">
                <Link
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={L.githubRepo}
                >
                  <Github className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.article>
    </FadeIn>
  );
}
