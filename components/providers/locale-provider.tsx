"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  defaultLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/types";
import { getTranslations, type TranslationKeys } from "@/lib/i18n/translations";
import type { SiteContentBundle } from "@/lib/content";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ar" || stored === "en" ? stored : defaultLocale;
}

function resolveTranslations(
  locale: Locale,
  contentBundle?: SiteContentBundle
): TranslationKeys {
  if (contentBundle) return contentBundle[locale];
  return getTranslations(locale);
}

export function LocaleProvider({
  children,
  contentBundle,
}: {
  children: React.ReactNode;
  contentBundle?: SiteContentBundle;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, mounted]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: resolveTranslations(locale, contentBundle),
      dir: locale === "ar" ? "rtl" : "ltr",
    }),
    [locale, setLocale, contentBundle]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
