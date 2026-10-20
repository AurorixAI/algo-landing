import { useId, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, CreditCard, GraduationCap, Send, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAmbientMotion } from "./AmbientMotion";
import { useContactForm } from "./ContactForm";
import SectionAtmosphere from "./SectionAtmosphere";
import "./telegram-chapter.css";

const copy = {
  ru: {
    kicker: "06 / TELEGRAM ДЛЯ СЕМЬИ", first: "Учёба — в центре.", accent: "Всё важное — в Telegram.",
    intro: "У ученика и родителя — отдельный доступ к ALGO. Результаты и посещаемость рядом, в привычном приложении.",
    audiences: ["Ученику", "Родителю"],
    descriptions: ["Своё расписание, посещаемость и результаты экзаменов. Личная учебная история в одном месте.", "Результаты и посещаемость ребёнка. Понятная картина того, как проходит обучение."],
    access: "Доступ к Telegram-приложениям подключает ваш учебный центр.",
    payment: "Онлайн-оплата обучения", soon: "Скоро", paymentText: "Готовим возможность оплачивать обучение из Telegram и видеть подтверждение платежа в ALGO.",
    cta: "Показать Telegram нашему центру", request: "Хочу посмотреть Telegram-приложения для учеников и родителей, результаты и посещаемость. Доступ через учебный центр.",
    personal: ["Личный кабинет ученика", "Кабинет родителя"], context: ["Мои данные", "Мой ребёнок"], sample: "Учебный пример", student: "Азиза Каримова", grade: "Алгебра · 8 класс",
    views: { results: "Результаты", attendance: "Посещения", schedule: "Расписание" },
    resultsTitle: ["Мои результаты", "Результаты ребёнка"], examType: "Экзамен · 16 октября", exam: "Квадратные уравнения", points: "из 10 баллов", detail: "Подробнее о результате", hideDetail: "Свернуть результат", questions: "Заданий в работе", correct: "Верно решено", errors: "С ошибкой",
    attendanceTitle: ["Моя посещаемость", "Посещаемость ребёнка"], lessonDates: ["18 октября", "16 октября", "14 октября"], attended: "Была", algebra: "Алгебра", nextLesson: "Ближайшее занятие · 20 октября", teacher: "Дилшод Рахимов", footer: ["Личный доступ", "Доступ родителя"],
  },
  en: {
    kicker: "06 / TELEGRAM FOR FAMILIES", first: "Learning at the centre.", accent: "Stay connected on Telegram.",
    intro: "Students and parents have separate access to ALGO. Results and attendance are close at hand, in a familiar app.",
    audiences: ["For students", "For parents"],
    descriptions: ["Your class schedule, attendance and exam results. A personal learning history in one place.", "Your child’s results and attendance. A clear view of how their learning is going."],
    access: "Your learning centre provides access to the Telegram apps.",
    payment: "Online tuition payments", soon: "Coming soon", paymentText: "We’re preparing tuition payments from Telegram, with payment confirmation in ALGO.",
    cta: "Show Telegram to our centre", request: "I’d like to see the Telegram apps for students and parents, including results and attendance. Access is provided by the learning centre.",
    personal: ["Student account", "Parent account"], context: ["My profile", "My child"], sample: "Learning example", student: "Aziza Karimova", grade: "Algebra · Grade 8",
    views: { results: "Results", attendance: "Attendance", schedule: "Schedule" },
    resultsTitle: ["My results", "My child’s results"], examType: "Exam · 16 October", exam: "Quadratic equations", points: "out of 10 points", detail: "View result details", hideDetail: "Hide result details", questions: "Questions in the paper", correct: "Answered correctly", errors: "Incorrect",
    attendanceTitle: ["My attendance", "My child’s attendance"], lessonDates: ["18 October", "16 October", "14 October"], attended: "Present", algebra: "Algebra", nextLesson: "Next class · 20 October", teacher: "Dilshod Rahimov", footer: ["Personal access", "Parent access"],
  },
  uz: {
    kicker: "06 / OILA UCHUN TELEGRAM", first: "Ta’lim — markazda.", accent: "Muhim ma’lumotlar — Telegram’da.",
    intro: "O‘quvchi va ota-onaning ALGO’ga kirishi alohida. Natijalar va davomat odatiy ilovada doim qo‘l ostida.",
    audiences: ["O‘quvchiga", "Ota-onaga"],
    descriptions: ["O‘z dars jadvali, davomati va imtihon natijalari. Shaxsiy o‘quv tarixi bir joyda.", "Farzandingizning natijalari va davomati. Ta’lim jarayoni qanday borayotganini kuzatib boring."],
    access: "Telegram ilovalariga kirishni o‘quv markazingiz ulaydi.",
    payment: "O‘qish uchun onlayn to‘lov", soon: "Tez orada", paymentText: "Telegram orqali o‘qish uchun to‘lash va ALGO’da to‘lov tasdig‘ini ko‘rish imkoniyatini tayyorlayapmiz.",
    cta: "Markazimizga Telegram’ni ko‘rsatish", request: "O‘quvchi va ota-onalar uchun Telegram ilovalari, natijalar va davomatni ko‘rishni istayman. Kirish o‘quv markazi orqali beriladi.",
    personal: ["O‘quvchi kabineti", "Ota-ona kabineti"], context: ["Ma’lumotlarim", "Farzandim"], sample: "O‘quv namunasi", student: "Aziza Karimova", grade: "Algebra · 8-sinf",
    views: { results: "Natijalar", attendance: "Davomat", schedule: "Jadval" },
    resultsTitle: ["Natijalarim", "Farzandimning natijalari"], examType: "Imtihon · 16-oktabr", exam: "Kvadrat tenglamalar", points: "10 balldan", detail: "Natija tafsilotlari", hideDetail: "Tafsilotlarni yig‘ish", questions: "Ishdagi topshiriqlar", correct: "To‘g‘ri yechilgan", errors: "Xato yechilgan",
    attendanceTitle: ["Davomatim", "Farzandimning davomati"], lessonDates: ["18-oktabr", "16-oktabr", "14-oktabr"], attended: "Qatnashgan", algebra: "Algebra", nextLesson: "Navbatdagi dars · 20-oktabr", teacher: "Dilshod Rahimov", footer: ["Shaxsiy kirish", "Ota-ona kirishi"],
  },
};

type View = "results" | "attendance" | "schedule";

export default function TelegramChapter() {
  const { locale } = useTranslation();
  const c = copy[locale];
  const { paused } = useAmbientMotion();
  const { open } = useContactForm();
  const id = useId();
  const preview = useRef<HTMLDivElement>(null);
  const [audience, setAudience] = useState(0);
  const [view, setView] = useState<View>("results");
  const [detail, setDetail] = useState(false);
  const views: View[] = audience === 0 ? ["results", "attendance", "schedule"] : ["results", "attendance"];

  function selectAudience(value: number) {
    if (value !== audience) {
      setAudience(value);
      setView("results");
      setDetail(false);
    }
    // On a phone the preview follows the audience cards: take the explicit
    // selection to its result instead of changing content below the viewport.
    if (window.matchMedia("(max-width: 760px)").matches) {
      preview.current?.focus({ preventScroll: true });
      preview.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
  }

  return <section className="telegram-chapter atmosphere-section" id="telegram" aria-labelledby="telegram-title">
    <SectionAtmosphere variant="path" paused={paused} />
    <div className="shell telegram-shell">
      <div className="telegram-layout">
        <div>
          <div className="telegram-intro"><div className="section-kicker mono">{c.kicker}</div><h2 id="telegram-title">{c.first}<br /><em>{c.accent}</em></h2><p>{c.intro}</p></div>
          <div className="telegram-audiences" role="group" aria-label={c.kicker}>{c.audiences.map((title, index) => {
            const Icon = index === 0 ? GraduationCap : Users;
            return <button className="telegram-audience" key={title} type="button" aria-pressed={audience === index} aria-controls={`${id}-preview`} onClick={() => selectAudience(index)}><Icon aria-hidden="true" /><span><strong>{title}</strong><span>{c.descriptions[index]}</span></span><ChevronRight aria-hidden="true" /></button>;
          })}</div>
          <p className="telegram-access"><ShieldCheck aria-hidden="true" />{c.access}</p>
          <div className="telegram-payment"><div className="telegram-payment-heading"><h3><CreditCard aria-hidden="true" />{c.payment}</h3><span className="telegram-soon">{c.soon}</span></div><p>{c.paymentText}</p></div>
          <button className="telegram-cta" type="button" onClick={() => open("demo", c.request)}>{c.cta}<ArrowRight aria-hidden="true" /></button>
        </div>
        <div className="telegram-device" id={`${id}-preview`} ref={preview} tabIndex={-1} aria-label={c.personal[audience]}>
          <div className="telegram-device-inner">
            <div className="telegram-app-header"><span className="telegram-app-logo" aria-hidden="true">∫</span><span><strong>ALGO</strong><span>{c.personal[audience]}</span></span><Send aria-hidden="true" /></div>
            <div className="telegram-profile"><div className="telegram-profile-top"><span>{c.context[audience]}</span><span>· {c.sample}</span></div><h3>{c.student}</h3><p>{c.grade}</p></div>
            <div className="telegram-preview-tabs" role="group" aria-label={c.personal[audience]}>{views.map(value => <button type="button" key={value} aria-pressed={view === value} aria-controls={`${id}-content`} onClick={() => { setView(value); setDetail(false); }}>{c.views[value]}</button>)}</div>
            <div className="telegram-app-content" id={`${id}-content`} aria-live="polite">
              {view === "results" && <><h4>{c.resultsTitle[audience]}</h4><div className="telegram-result-card"><p>{c.examType}</p><strong>{c.exam}</strong><div className="telegram-score"><b>8</b><span>{c.points}</span></div><div className="telegram-score-bar" aria-hidden="true"><span /></div><button type="button" aria-expanded={detail} aria-controls={`${id}-result`} onClick={() => setDetail(value => !value)}>{detail ? c.hideDetail : c.detail}<ChevronDown size={15} aria-hidden="true" /></button>{detail && <div className="telegram-result-detail" id={`${id}-result`}><p><span>{c.questions}</span><b>5</b></p><p><span>{c.correct}</span><b>4 / 5</b></p><p><span>{c.errors}</span><b>1</b></p></div>}</div></>}
              {view === "attendance" && <><h4>{c.attendanceTitle[audience]}</h4><ul className="telegram-attendance-list">{c.lessonDates.map(date => <li key={date}><CheckCircle2 aria-hidden="true" /><span>{date}<small>{c.algebra}</small></span><b>{c.attended}</b></li>)}</ul></>}
              {view === "schedule" && <><h4>{c.views.schedule}</h4><div className="telegram-lesson"><p>{c.nextLesson}</p><strong>{c.algebra}</strong><div>14:00–15:30</div><span><BookOpen aria-hidden="true" />{c.teacher}</span></div></>}
            </div>
            <div className="telegram-device-foot"><span>{c.footer[audience]}</span><span>Telegram</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
