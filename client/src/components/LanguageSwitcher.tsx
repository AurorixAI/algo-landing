import { useTranslation, type Locale } from "@/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const flags: Record<Locale, string> = { uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧" };
const labels: Record<Locale, string> = { uz: "O'zbekcha", ru: "Русский", en: "English" };

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 hover:bg-slate-100"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{flags[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-50">
          {(["uz", "ru", "en"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                locale === l
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-base">{flags[l]}</span>
              {labels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
