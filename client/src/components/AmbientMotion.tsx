import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "@/i18n";
import "./ambient-motion.css";

type AmbientMotionValue = {
  paused: boolean;
  toggle: () => void;
};

const AmbientMotionContext = createContext<AmbientMotionValue>({ paused: false, toggle: () => {} });

/** Shared playback for decorative backgrounds; product interactions keep their own motion. */
export function AmbientMotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const toggle = useCallback(() => setPaused(current => !current), []);
  const value = useMemo(() => ({ paused, toggle }), [paused, toggle]);

  return <AmbientMotionContext.Provider value={value}>{children}</AmbientMotionContext.Provider>;
}

export function useAmbientMotion() {
  return useContext(AmbientMotionContext);
}

export function AmbientMotionToggle({ variant = "hero" }: { variant?: "hero" | "header" }) {
  const { locale } = useTranslation();
  const { paused, toggle } = useAmbientMotion();
  const reducedMotion = useReducedMotion();
  const label = paused
    ? { ru: "Продолжить фоновые анимации", uz: "Fon animatsiyalarini davom ettirish", en: "Resume background animations" }[locale]
    : { ru: "Приостановить фоновые анимации", uz: "Fon animatsiyalarini to‘xtatib turish", en: "Pause background animations" }[locale];

  if (reducedMotion) return null;

  return <button
    className={variant === "hero" ? "hero-motion-toggle" : "ambient-motion-header-toggle"}
    type="button"
    aria-label={label}
    title={label}
    onClick={toggle}
  >
    {paused ? <Play size={variant === "hero" ? 12 : 14} aria-hidden="true" /> : <Pause size={variant === "hero" ? 12 : 14} aria-hidden="true" />}
  </button>;
}
