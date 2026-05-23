"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { layout } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navIds = ["work", "about", "contact"] as const;

export function Navbar() {
  const { t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navIds.map((id) => ({
    id,
    href: id === "work" ? "#projects" : `#${id}`,
    label: t.nav[id],
  }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        layout.navbarShell,
        "transition-[background,border,box-shadow] duration-300",
        scrolled
          ? "border-b border-neutral-800/80 bg-[#080808]/90 shadow-sm shadow-black/20 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav
        className={cn(layout.container, layout.navbarInner)}
      >
        <Link
          href="/"
          className="col-start-1 justify-self-start font-display text-sm tracking-wide text-cream-50 transition-colors hover:text-emerald-400 sm:text-lg"
        >
          A<span className="text-emerald-500">.</span>T
        </Link>

        <ul className="col-start-2 hidden items-center justify-center gap-5 md:flex lg:gap-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] text-cream-300/70 transition-colors hover:text-emerald-400 lg:text-xs lg:tracking-[0.22em]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="col-start-3 hidden items-center justify-self-end gap-2 md:flex lg:gap-3">
          <LanguageSwitcher />
          <Button asChild variant="outline" size="sm" className="h-9 px-3 text-xs lg:h-9 lg:px-4">
            <Link href="#contact">{t.nav.getInTouch}</Link>
          </Button>
        </div>

        <div className="col-start-3 flex items-center justify-self-end gap-1 md:hidden">
          <LanguageSwitcher />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 min-h-8 min-w-8 sm:h-9 sm:w-9"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-neutral-800 bg-[#080808]/98 backdrop-blur-md md:hidden"
          >
            <ul className={cn(layout.container, "flex flex-col gap-1 py-4")}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-sm px-2 py-3 text-sm uppercase tracking-[0.15em] text-cream-200 transition-colors hover:bg-neutral-900/60 hover:text-emerald-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="h-10 w-full">
                  <Link href="#contact" onClick={() => setMobileOpen(false)}>
                    {t.nav.getInTouch}
                  </Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
