import { useEffect, type ReactNode } from "react";
import { lazy, Suspense } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useContactForm } from "@/components/ContactForm";
import { CapabilityMap, TeamTrust, DemoSection } from "@/components/ProductStory";
import QuestionsSection from "@/components/QuestionsSection";
import KnowledgeLandscape from "@/components/KnowledgeLandscape";
import SiteNavigation, { Brand, siteLinks } from "@/components/SiteNavigation";
import SectionAtmosphere from "@/components/SectionAtmosphere";
import { AmbientMotionProvider, useAmbientMotion } from "@/components/AmbientMotion";
import "@/components/section-system.css";
import { ApproachSection, FutureSection } from "@/components/VisionSections";
import { landingCopy } from "./landing-copy";
import { completeEntryScroll } from "./entry-scroll";

const ExamChapter = lazy(() => import("@/components/ExamChapter"));
const DiagnosticChapter = lazy(() => import("@/components/DiagnosticChapter"));
const OperationsChapter = lazy(() => import("@/components/OperationsChapter"));
const FinanceChapter = lazy(() => import("@/components/FinanceChapter"));
const TelegramChapter = lazy(() => import("@/components/TelegramChapter"));

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function SectionBackdrop({ variant }: { variant: "atlas" | "path" | "orbit" | "paper" | "converge" }) {
  const { paused } = useAmbientMotion();
  return <SectionAtmosphere variant={variant} paused={paused} />;
}

function DemoButton({ children, className = "", light = false }: { children?: ReactNode; className?: string; light?: boolean }) {
  const { locale } = useTranslation();
  const { open } = useContactForm();
  return <button className={`button ${light ? "button-white" : "button-blue"} ${className}`} onClick={() => open("demo")}><span>{children || landingCopy[locale].demo}</span><ArrowUpRight size={18} aria-hidden="true" /></button>;
}

function Hero() {
  const { locale } = useTranslation();
  const c = landingCopy[locale];
  const { paused } = useAmbientMotion();
  return <section className="hero" aria-labelledby="hero-title">
    <KnowledgeLandscape paused={paused} />
    <div className="shell hero-copy">
      <Reveal><div className="eyebrow hero-eyebrow"><span className="status-dot" />{c.eyebrow}</div></Reveal>
      <Reveal delay={0.07}><h1 id="hero-title">{c.heroFirst}<br />{c.heroSecond} <em>{c.heroAccent}</em></h1></Reveal>
      <Reveal delay={0.14}><p className="hero-description">{c.heroText}</p></Reveal>
      <Reveal delay={0.21}><div className="hero-actions"><DemoButton /><a className="button button-outline" href="#platform">{c.explore}<ArrowDown size={17} aria-hidden="true" /></a></div></Reveal>

    </div>
  </section>;
}

function Closing() {
  const { locale } = useTranslation();
  const c = landingCopy[locale];
  return <section className="closing-section atmosphere-section" id="next-step"><SectionBackdrop variant="converge" /><div className="shell closing-content"><Reveal><div className="section-kicker mono"><span className="status-dot" />{c.ctaLabel}</div><h2>{c.ctaFirst}<br /><em>{c.ctaAccent}</em></h2><p>{c.ctaText}</p><DemoButton light>{c.ctaButton}</DemoButton></Reveal></div></section>;
}

function Footer() {
  const { locale } = useTranslation();
  const c = landingCopy[locale];
  const { open } = useContactForm();
  return <footer className="site-footer"><div className="shell"><div className="footer-top"><div className="footer-brand"><Brand /><p>{c.footerText}</p></div><div className="footer-links"><span className="mono">{c.footerProduct}</span>{siteLinks(locale).map(link => <a key={link.id} href={`#${link.id}`}>{link.label}</a>)}</div><div className="footer-links"><span className="mono">{c.footerContact}</span><button onClick={() => open("demo")}>{c.demo}<ArrowUpRight size={14} /></button><button onClick={() => open("pitchDeck")}>{c.footerPartner}<ArrowUpRight size={14} /></button><a href="https://algolab.me/login">{c.login}<ArrowUpRight size={14} /></a></div></div><div className="footer-bottom"><span>{c.footerRights}</span><span className="footer-signature mono">EDUCATION, CONNECTED.</span><a href="#top">{c.backTop}<ArrowUpRight size={14} /></a></div></div></footer>;
}

function ProductChapters() {
  useEffect(() => { completeEntryScroll(); }, []);
  return <><ExamChapter /><DiagnosticChapter /><OperationsChapter /><FinanceChapter /><TelegramChapter /></>;
}

export default function App() {
  const { locale } = useTranslation();
  const c = landingCopy[locale];
  useEffect(() => {
    const titles = { ru: "ALGO — Сильный центр. Сильные ученики.", en: "ALGO — A stronger center. Stronger students.", uz: "ALGO — Kuchli markaz. Kuchli o‘quvchilar." };
    document.title = titles[locale];
    document.querySelector('meta[name="description"]')?.setAttribute("content", c.heroText);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", titles[locale]);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", c.heroText);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", titles[locale]);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", c.heroText);
  }, [locale, c.heroText]);
  return <MotionConfig reducedMotion="user"><AmbientMotionProvider><div className="algo-site" id="top"><a className="skip-link" href="#main-content">{c.skip}</a><SiteNavigation /><main id="main-content"><Hero /><CapabilityMap /><Suspense fallback={<div className="story-chapter-fallback" id="exams" />}><ProductChapters /></Suspense><ApproachSection /><TeamTrust /><FutureSection /><DemoSection /><QuestionsSection /><Closing /></main><Footer /></div></AmbientMotionProvider></MotionConfig>;
}
