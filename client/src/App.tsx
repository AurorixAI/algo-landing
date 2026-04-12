import { 
  Play, Radar, Brain, Menu, X, Shield, Bell, Sliders, 
  Smartphone, ArrowRight, Globe,
  Zap, Users, Target, BarChart, Award,
  Sparkles, History, Laptop, GraduationCap, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";
import { useContactForm } from "@/components/ContactForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Navbar = () => {
  const { t } = useTranslation();
  const { open } = useContactForm();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.platform, href: "#platform" },
    { name: t.nav.architecture, href: "#journey" },
    { name: t.nav.apiIntegrations, href: "#features" },
    { name: t.nav.ecosystem, href: "#ecosystem" },
    { name: t.nav.investors, href: "#investors" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.1)] border-b border-slate-200/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-xl font-serif italic font-medium">∫</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ALGO</span>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-slate-500 transition-all hover:text-blue-600 hover:translate-y-[-1px]">
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <button className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
            {t.nav.login}
          </button>
          <button
            onClick={() => open("demo")}
            className="relative group overflow-hidden rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/20"
          >
            <span className="relative z-10">{t.nav.demoForSchools}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
          {isMobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 border-b border-slate-100 bg-white p-6 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-lg font-bold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </a>
              ))}
              <div className="mt-2">
                <LanguageSwitcher />
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <button className="rounded-xl bg-slate-50 px-5 py-3 text-center text-sm font-bold text-slate-900">{t.nav.login}</button>
                <button onClick={() => { open("demo"); setIsMobileMenuOpen(false); }} className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-lg">{t.nav.demoForSchools}</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  const { open } = useContactForm();

  return (
    <section id="platform" className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
      <div className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] rounded-full bg-blue-100/30 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[800px] w-[800px] rounded-full bg-indigo-50/30 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="mb-8 inline-flex items-center gap-2 self-start rounded-full bg-white py-1.5 pr-4 pl-1.5 border border-slate-200 shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="mb-6 text-6xl font-black tracking-tight text-slate-900 sm:text-7xl xl:text-8xl leading-[0.95]">
              {t.hero.titleLine1}<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                {t.hero.titleLine2}
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-xl leading-relaxed text-slate-500 font-medium">
              {t.hero.description}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => open("connect")}
                className="group relative inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-10 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
              >
                {t.hero.connectCenter}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-8 text-lg font-bold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95">
                <Play className="h-5 w-5 fill-blue-600 text-blue-600" />
                {t.hero.howItWorks}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-blue-100 to-indigo-100 opacity-50 blur-2xl -z-10" />
            <div className="relative rounded-[2rem] border-4 border-white bg-white/40 p-1 shadow-2xl backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-inner">
                <div className="flex items-center justify-between bg-slate-50/80 px-6 py-4 border-b border-slate-100">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                    <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                    <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <History className="h-3 w-3" /> {t.hero.liveDiagnosis}
                  </div>
                </div>

                <div className="p-6 sm:p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Users className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900">{t.hero.studentName}</div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{t.hero.studentInfo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">{t.hero.scoreLabel}</div>
                      <div className="text-3xl font-black text-slate-900">A+</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: t.hero.coreAccuracy, value: t.hero.coreAccuracyValue, color: "bg-blue-600" },
                      { label: t.hero.knowledgeGraph, value: t.hero.knowledgeGraphValue, color: "bg-indigo-500" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>{stat.label}</span>
                          <span className="text-slate-900">{stat.value}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={`h-full ${stat.color} rounded-full`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border-2 border-blue-50 bg-blue-50/30 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Brain className="h-12 w-12 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 font-black text-sm uppercase mb-2">
                      <Sparkles className="h-4 w-4" /> {t.hero.aiInsightLabel}
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {t.hero.aiInsightPrefix}<span className="text-blue-600 font-bold">{t.hero.aiInsightHighlight}</span>{t.hero.aiInsightSuffix}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Journey = () => {
  const { t } = useTranslation();
  const icons = [Radar, Laptop, BarChart];

  return (
    <section id="journey" className="py-24 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl mb-6">{t.journey.title}</h2>
          <p className="text-xl text-slate-500 font-medium">{t.journey.subtitle}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {t.journey.steps.map((step, i) => {
            const Icon = icons[i];
            return (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="relative p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="mb-2 text-xs font-black text-blue-600 uppercase tracking-widest">{step.subtitle}</div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Ecosystem = () => {
  const { t } = useTranslation();
  const partIcons = [Sliders, GraduationCap, Smartphone, Bell];

  return (
    <section id="ecosystem" className="py-24 lg:py-32 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-900 sm:text-5xl mb-8 leading-tight">
              {t.ecosystem.titleLine1}<br />{t.ecosystem.titleLine2}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {t.ecosystem.parts.map((p, i) => {
                const Icon = partIcons[i];
                return (
                  <div key={i} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-1">{p.name}</div>
                    <div className="text-xs font-bold text-blue-600 uppercase mb-3">{p.role}</div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-20 bg-blue-600/5 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="h-48 rounded-3xl bg-white shadow-xl border border-slate-100 p-6 flex flex-col justify-end">
                   <Users className="h-8 w-8 text-blue-600 mb-4" />
                   <div className="text-2xl font-black text-slate-900">{t.ecosystem.studentsCount}</div>
                   <div className="text-xs font-bold text-slate-400 uppercase">{t.ecosystem.studentsLabel}</div>
                </div>
                <div className="h-64 rounded-3xl bg-slate-900 shadow-xl p-6 text-white flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <Shield className="h-8 w-8 text-blue-400" />
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.ecosystem.secureAi}</div>
                   </div>
                   <div>
                     <div className="text-3xl font-black mb-1">{t.ecosystem.accuracyValue}</div>
                     <div className="text-xs font-bold text-slate-400 uppercase">{t.ecosystem.accuracyLabel}</div>
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-72 rounded-3xl bg-blue-600 shadow-xl p-6 text-white flex flex-col justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                     <Globe className="h-32 w-32" />
                   </div>
                   <Award className="h-8 w-8" />
                   <div>
                     <div className="text-3xl font-black mb-1">{t.ecosystem.globalValue}</div>
                     <div className="text-xs font-bold text-blue-200 uppercase tracking-widest">{t.ecosystem.globalLabel}</div>
                   </div>
                </div>
                <div className="h-40 rounded-3xl bg-white shadow-xl border border-slate-100 p-6 flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                     <TrendingUp className="h-6 w-6" />
                   </div>
                   <div>
                     <div className="text-lg font-black text-slate-900">{t.ecosystem.growthValue}</div>
                     <div className="text-[10px] font-black text-slate-400 uppercase">{t.ecosystem.growthLabel}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ScalingVision = () => {
  const { t } = useTranslation();
  const cardIcons = [Brain, Target, Award];

  return (
    <section id="vision" className="relative overflow-hidden bg-slate-950 py-32 text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)]" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10 text-center mb-24">
        <div className="mb-8 inline-flex items-center rounded-full bg-blue-500/10 px-6 py-2 text-sm font-black text-blue-400 border border-blue-500/20 uppercase tracking-[0.3em]">
          {t.vision.badge}
        </div>
        <h2 className="text-5xl font-black sm:text-7xl mb-8 tracking-tighter leading-none">
          {t.vision.titleLine1} <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">{t.vision.titleLine2}</span>
        </h2>
        <p className="max-w-3xl mx-auto text-xl text-slate-400 font-medium leading-relaxed">
          {t.vision.description}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {t.vision.cards.map((card, i) => {
            const Icon = cardIcons[i];
            return (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 group">
                <div className="mb-6 h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black mb-4">{card.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const InvestorsHub = () => {
  const { t } = useTranslation();
  const { open } = useContactForm();

  return (
    <section id="investors" className="py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight">{t.investors.titleLine1}<br />{t.investors.titleLine2}</h2>
            <p className="text-xl text-slate-500 font-medium mb-12 leading-relaxed">
              {t.investors.description}
            </p>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.investors.businessModelLabel}</span>
                <span className="font-black text-slate-900">{t.investors.businessModelValue}</span>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.investors.ipStatusLabel}</span>
                <span className="font-black text-slate-900 text-right max-w-[60%]">{t.investors.ipStatusValue}</span>
              </div>
            </div>
            <button
              onClick={() => open("pitchDeck")}
              className="mt-12 w-full sm:w-auto h-16 px-10 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-2xl transition-all hover:bg-black hover:translate-y-[-2px] active:scale-95"
            >
              {t.investors.requestPitchDeck}
            </button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="space-y-4 pt-8">
               <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl">
                  <div className="text-4xl font-black mb-2">{t.investors.stat1Value}</div>
                  <div className="text-xs font-bold text-blue-200 uppercase tracking-widest leading-relaxed">{t.investors.stat1Label}</div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-slate-100 text-slate-900">
                  <div className="text-4xl font-black mb-2">{t.investors.stat2Value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.investors.stat2Label}</div>
               </div>
             </div>
             <div className="space-y-4">
               <div className="p-8 rounded-[2.5rem] bg-indigo-50 text-indigo-600">
                  <div className="text-4xl font-black mb-2">{t.investors.stat3Value}</div>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{t.investors.stat3Label}</div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-emerald-500 text-white shadow-2xl">
                  <div className="text-4xl font-black mb-2">{t.investors.stat4Value}</div>
                  <div className="text-xs font-bold text-emerald-100 uppercase tracking-widest">{t.investors.stat4Label}</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-50 py-24 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <span className="text-2xl font-serif italic font-medium">∫</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">ALGO</span>
            </div>
            <p className="max-w-sm text-slate-500 font-medium leading-relaxed">
              {t.footer.description}
            </p>
          </div>
          <div>
            <div className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">{t.footer.productsHeading}</div>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.adminPortal}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.teacherDashboard}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.studentApp}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.apiDocs}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">{t.footer.companyHeading}</div>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.technology}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.investorsLink}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.contacts}</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">{t.footer.linkedin}</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div>{t.footer.copyright}</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-blue-600">{t.footer.privacy}</a>
            <a href="#" className="hover:text-blue-600">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Journey />
        <Ecosystem />
        <ScalingVision />
        <InvestorsHub />
      </main>
      <Footer />
    </div>
  );
}
