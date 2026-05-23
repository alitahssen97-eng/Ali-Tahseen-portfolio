"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/motion";
import { layout, siteConfig } from "@/lib/constants";
import { useLocale } from "@/components/providers/locale-provider";

const navIds = ["about", "work", "contact"] as const;

export function Footer() {
  const { t, locale } = useLocale();
  const displayName = locale === "ar" ? siteConfig.nameAr : siteConfig.name;
  const year = new Date().getFullYear();

  const navItems = navIds.map((id) => ({
    id,
    href: id === "work" ? "#projects" : `#${id}`,
    label: t.nav[id],
  }));

  return (
    <footer className="w-full min-w-0 overflow-x-clip border-t border-neutral-800/80 bg-[#060606]">
      <ScrollReveal
        preset="footer"
        className={`${layout.container} flex flex-col items-center justify-between gap-6 py-10 sm:py-12 md:flex-row md:gap-8`}
      >
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-cream-400/50 sm:text-xs sm:tracking-[0.25em] md:text-start">
          © {year} {displayName}. {t.footer.crafted}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-xs uppercase tracking-[0.2em] text-cream-400/60 transition-colors hover:text-emerald-400"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </footer>
  );
}
