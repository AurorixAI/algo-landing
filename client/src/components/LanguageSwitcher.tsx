import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useTranslation, type Locale } from "@/i18n";
import "./language-switcher.css";

const languages: { locale: Locale; name: string; code: string }[] = [
  { locale: "ru", name: "Русский", code: "RU" },
  { locale: "uz", name: "O‘zbekcha", code: "UZ" },
  { locale: "en", name: "English", code: "EN" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const label = { ru: "Язык сайта", uz: "Sayt tili", en: "Website language" }[locale];

  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger asChild>
      <button className="language-trigger" type="button" aria-label={`${label}: ${locale.toUpperCase()}`}>
        <Globe2 className="language-globe" size={16} aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown className="language-chevron" size={12} aria-hidden="true" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="language-menu" align="end" sideOffset={10} collisionPadding={12}>
        <DropdownMenu.Label className="language-menu-label">{label}</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={locale} aria-label={label} onValueChange={value => setLocale(value as Locale)}>
          {languages.map(language => <DropdownMenu.RadioItem key={language.locale} className="language-option" value={language.locale} textValue={language.name}>
            <span className="language-option-check" aria-hidden="true"><DropdownMenu.ItemIndicator><Check size={14} strokeWidth={2.4} /></DropdownMenu.ItemIndicator></span>
            <span className="language-option-name" lang={language.locale}>{language.name}</span>
            <span className="language-option-code" aria-hidden="true">{language.code}</span>
          </DropdownMenu.RadioItem>)}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
