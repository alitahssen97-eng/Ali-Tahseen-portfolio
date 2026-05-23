"use client";

import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  const options: { id: Locale; label: string }[] = [
    { id: "en", label: t.lang.en },
    { id: "ar", label: t.lang.ar },
  ];

  return (
    <div
      role="group"
      aria-label={t.lang.switchTo}
      className={cn(
        "inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-950/60 p-0.5 backdrop-blur-sm",
        className
      )}
    >
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          className={cn(
            "min-w-[2rem] rounded-sm px-1.5 py-1 text-[10px] font-medium transition-all duration-300 sm:min-w-[2.5rem] sm:px-2.5 sm:py-1.5 sm:text-xs",
            locale === id
              ? "bg-emerald-600/90 text-cream-50 shadow-sm"
              : "text-cream-400/70 hover:text-emerald-300"
          )}
          aria-pressed={locale === id}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
