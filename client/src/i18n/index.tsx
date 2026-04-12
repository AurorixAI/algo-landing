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

function detectLocale(): Locale {
  const saved = localStorage.getItem("algo-lang");
  if (saved && ["ru", "en", "uz"].includes(saved)) return saved as Locale;
  const nav = navigator.language.slice(0, 2).toLowerCase();
  if (nav === "uz") return "uz";
  if (nav === "en") return "en";
  return "ru";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("algo-lang", l);
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
