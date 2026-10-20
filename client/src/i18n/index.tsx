import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "ru",
  setLocale: () => {},
  t: translations.ru,
});

function safeGetStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Safari private mode */ }
}

function detectLocale(): Locale {
  const saved = safeGetStorage("algo-lang");
  if (saved && ["ru", "en", "uz"].includes(saved)) return saved as Locale;
  try {
    const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const language of preferred) {
      const candidate = language.split(/[-_]/)[0].toLowerCase();
      if (candidate === "ru" || candidate === "en" || candidate === "uz") return candidate;
    }
  } catch { /* ignore */ }
  return "ru";
}


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    safeSetStorage("algo-lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export type { Locale, Translations };
