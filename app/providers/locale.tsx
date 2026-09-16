"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Locale, t } from "@/lib/i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof t>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("kk");

  useEffect(() => {
    const stored = localStorage.getItem("iwm-locale") as Locale | null;
    if (stored && ["kk", "ru", "en"].includes(stored)) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("iwm-locale", newLocale);
  };

  const value = {
    locale,
    setLocale,
    t: t(locale),
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
