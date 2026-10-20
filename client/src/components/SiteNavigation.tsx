import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, BookOpen, ChevronDown, Layers3, Menu, ScanLine, Send, Users, Wallet, X } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTranslation, type Locale } from "@/i18n";
import { useContactForm } from "./ContactForm";
import LanguageSwitcher from "./LanguageSwitcher";
import { AmbientMotionToggle } from "./AmbientMotion";
import { landingCopy } from "@/landing-copy";
import "./site-navigation.css";

const copy = {
  ru: { label:"Навигация по сайту", platform:"Платформа", overview:"Все возможности", about:["Подход ALGO","Для команды","Развитие"], modules:["Экзамены и библиотека","Диагностика","Ученики и занятия","Оплаты и зарплата","Telegram для семьи"], descriptions:["Подготовка, проведение и разбор","Ответы, навыки и учебный план","Группы, уроки и посещаемость","Квитанции и расчёты по урокам","Результаты и посещаемость ученика"], contents:"Разделы сайта" },
  uz: { label:"Sayt bo‘ylab navigatsiya", platform:"Platforma", overview:"Barcha imkoniyatlar", about:["ALGO yondashuvi","Jamoa uchun","Rivojlanish"], modules:["Imtihonlar va kutubxona","Diagnostika","O‘quvchilar va darslar","To‘lovlar va ish haqi","Oila uchun Telegram"], descriptions:["Tayyorlash, o‘tkazish va tahlil","Javoblar, ko‘nikmalar va o‘quv rejasi","Guruhlar, darslar va davomat","Kvitansiyalar va darslar bo‘yicha hisob","O‘quvchi natijalari va davomati"], contents:"Sayt bo‘limlari" },
  en: { label:"Site navigation", platform:"Platform", overview:"All capabilities", about:["Our approach","For your team","What’s next"], modules:["Exams and library","Diagnostics","Students and lessons","Payments and payroll","Telegram for families"], descriptions:["Prepare, run and review","Answers, skills and a learning plan","Groups, lessons and attendance","Receipts and lesson-based calculations","Student results and attendance"], contents:"Explore ALGO" },
};
const moduleIds = ["exams","diagnostics","operations","finance","telegram"];
const aboutIds = ["approach","team","future"];
const moduleIcons = [BookOpen,ScanLine,Users,Wallet,Send];
export function siteLinks(locale:Locale) {
  const c = copy[locale];
  return [{ id:"platform",label:c.overview },...moduleIds.map((id,i)=>({id,label:c.modules[i]})),...aboutIds.map((id,i)=>({id,label:c.about[i]}))];
}
export function Brand() {
  return <a className="brand" href="#top" aria-label="ALGO"><span className="brand-symbol" aria-hidden="true">∫</span><span>ALGO</span></a>;
}
export default function SiteNavigation() {
  const { locale } = useTranslation();
  const c = copy[locale];
  const common = landingCopy[locale];
  const { open } = useContactForm();
  const [menu,setMenu] = useState(false);
  const [active,setActive] = useState("");
  const [scrolled,setScrolled] = useState(false);
  const product = useRef<HTMLDetailsElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress,{stiffness:120,damping:30});
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      setScrolled(window.scrollY>20);
      const ids=["platform",...moduleIds,...aboutIds,"demo","questions"];
      let current="";
      for(const id of ids) {
        const section=document.getElementById(id);
        if(section && section.getBoundingClientRect().top<=160) current=id;
      }
      setActive(current);
    };
    const onScroll=()=>{if(!frame) frame=requestAnimationFrame(update);};
    const onOutside=(event:PointerEvent)=>{if(!product.current?.contains(event.target as Node)) product.current?.removeAttribute("open");};
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape" && product.current?.open){product.current.open=false;product.current.querySelector("summary")?.focus();}};
    update();
    window.addEventListener("scroll",onScroll,{passive:true});
    document.addEventListener("pointerdown",onOutside);
    document.addEventListener("keydown",onKey);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",onScroll);document.removeEventListener("pointerdown",onOutside);document.removeEventListener("keydown",onKey);};
  },[]);
  const current=(id:string)=>active===id?"location" as const:undefined;
  const close=()=>{setMenu(false);if(product.current) product.current.open=false;};
  const demo=()=>{close();open("demo");};
  return <header className={`site-header${scrolled?" is-scrolled":""}`}>
    <motion.div className="reading-progress" style={{scaleX}} aria-hidden="true"/>
    <div className="shell header-inner"><Brand/>
      <nav className="desktop-nav" aria-label={c.label}>
        <details className="site-nav-product" ref={product}><summary className="site-nav-link" data-active={["platform",...moduleIds].includes(active)}>{c.platform}<ChevronDown size={15} aria-hidden="true"/></summary>
          <div className="site-nav-panel"><a className="site-nav-overview" href="#platform" onClick={close} aria-current={current("platform")}><span>{c.overview}</span><Layers3 size={17} aria-hidden="true"/></a><div className="site-nav-grid">{moduleIds.map((id,i)=>{const Icon=moduleIcons[i];return <a key={id} href={`#${id}`} onClick={close} aria-current={current(id)}><Icon size={18} aria-hidden="true"/><div><strong>{c.modules[i]}</strong><span>{c.descriptions[i]}</span></div></a>;})}</div></div>
        </details>{aboutIds.map((id,i)=><a className="site-nav-link" key={id} href={`#${id}`} aria-current={current(id)}>{c.about[i]}</a>)}
      </nav>
      <div className="header-actions"><AmbientMotionToggle variant="header"/><LanguageSwitcher/><a className="login-link" href="https://algolab.me/login">{common.login}<ArrowUpRight size={13} aria-hidden="true"/></a><button className="button button-blue header-demo" onClick={demo}>{common.demo}<ArrowUpRight size={15} aria-hidden="true"/></button>
        <Dialog.Root open={menu} onOpenChange={setMenu}><Dialog.Trigger className="menu-toggle" aria-label={common.menu}><Menu size={22} aria-hidden="true"/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="site-menu-layer"/><Dialog.Content className="site-menu-dialog" aria-describedby={undefined}><div className="site-menu-heading"><Dialog.Title>{c.contents}</Dialog.Title><Dialog.Close className="site-menu-close" aria-label={common.close}><X size={21} aria-hidden="true"/></Dialog.Close></div><nav className="site-menu-nav" aria-label={c.label}><a href="#platform" onClick={close} aria-current={current("platform")}>{c.overview}<ArrowUpRight size={17} aria-hidden="true"/></a><span>{c.platform}</span>{moduleIds.map((id,i)=><a className="site-menu-module" key={id} href={`#${id}`} onClick={close} aria-current={current(id)}>{c.modules[i]}<ArrowUpRight size={16} aria-hidden="true"/></a>)}{aboutIds.map((id,i)=><a className={i===0?"site-menu-divider":""} key={id} href={`#${id}`} onClick={close} aria-current={current(id)}>{c.about[i]}<ArrowUpRight size={17} aria-hidden="true"/></a>)}</nav><div className="site-menu-bottom"><a href="https://algolab.me/login">{common.login}<ArrowUpRight size={17} aria-hidden="true"/></a><button className="button button-blue" onClick={demo}>{common.demo}<ArrowUpRight size={18} aria-hidden="true"/></button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
      </div>
    </div>
  </header>;
}
