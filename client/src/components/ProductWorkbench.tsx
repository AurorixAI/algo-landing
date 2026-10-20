import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity, AlertCircle, Anchor, ArrowLeft, Banknote, BookOpen,
  Brain, Building2, CalendarDays, Check, CheckCircle2, ChevronDown, ClipboardCheck,
  Clock, FileText, GitBranch, GraduationCap, LayoutDashboard, Library, ListChecks,
  Search, Settings, Shield, Target, Trophy, Users, Wallet, XCircle,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import "./product-workbench.css";

// Screen structure and tokens: algo-front origin/main c15fc86793372bfd3497e233a40b410d64a57dc0.
// All people, groups, amounts and results below are fictional demonstration data.
// The sample equation is from demo/scripts/build-fixtures.mjs (G7_P08), not a live attempt.
const copy = {
  ru: {
    tabs: ["Управление центром", "Диагностика", "Экзамены"], shortTabs: ["Центр", "Диагностика", "Экзамены"],
    workspace: "Обзор платформы", hint: "Переключайте реальные разделы", demo: "Демонстрационный пример",
    caption: "Упрощённый обзор интерфейса ALGO. Данные приведены для примера.",
    center: "Демоцентр", navigation: "Навигация", dashboard: "Панель управления", groups: "Группы", students: "Ученики", attendance: "Посещаемость", payments: "Оплаты", payroll: "Зарплата", staff: "Сотрудники", settings: "Настройки аккаунта", roles: ["Владелец", "Администратор", "Преподаватель"],
    teacherDashboard: "Дашборд", schedule: "Расписание", myGroups: "Мои группы", greeting: "Добрый день, Владелец", date: "18 октября 2026", active: "Система активна", centerType: "Репетиторский центр",
    stats: ["Всего учеников", "Сотрудников", "Пройдено диагностик", "Средний уровень (θ)"], leaders: "Лидеры успеваемости", leaderDesc: "Группы с высшим средним баллом", risks: "Зоны риска", riskDesc: "Группы, требующие внимания", demoGroups: ["Группа 01", "Группа 02", "Группа 03"], studentCount: "уч.",
    paymentDesc: "Кто из учеников оплатил занятия и когда оплата заканчивается", paymentTabs: ["Требуют оплаты", "Скоро заканчивается", "Нет данных", "Оплачено"], paymentHeaders: ["Ученик", "Группа", "В месяц", "Статус", "Последняя оплата"], student: "Ученик", paid: "Оплачено до 31.10.2026", payExpired: "Оплата закончилась", payExpiring: "Через 2 дн.", noData: "Нет данных", currency: "сум", search: "Имя или ID ученика", searchExams: "Поиск...", total: "Всего", empty: "Ничего не найдено",
    report: "Отчёт диагностики", grade: "7 класс", level: "Уровень", levelStatus: "Частичные пробелы", solved: "Верно 14 из 20 заданий разной трудности", correct: "Верных", wrong: "Ошибок", reportTabs: ["Журнал ошибок", "Анализ навыков", "План обучения"],
    reportSection: "Разделы отчёта", linear: "Линейные уравнения", statement: "Условие задачи", solve: "Решите уравнение", answer: "Ответ ученика", rightAnswer: "Верный ответ", recordNote: "Фрагмент журнала · пример одного ответа", exampleResponse: "Выбранный ответ сохранён в журнале вместе с верным вариантом.",
    boundary: "Академическая граница знаний", foundation: "Опорный фундамент", foundationDesc: "Темы, по которым были верные ответы.", foundationSkill: "Действия с целыми числами", currentErrors: "Ошибки в текущем классе", currentErrorsDesc: "Навыки текущего класса, в которых были ошибки.", route: "Индивидуальный образовательный маршрут", routeDesc: "План отработки навыков в порядке приоритета.", start: "Стартовая точка", structure: "Структура трека", stages: "2 этапа освоения", planNames: ["Линейные уравнения", "Уравнения со скобками"], planDescriptions: ["Разобрать преобразования уравнения и проверить корень подстановкой.", "Применить преобразования в уравнении со скобками."],
    library: "Библиотека экзаменов", libraryDesc: "Управляйте экзаменами и шаблонами", examStats: ["Текущие", "В лобби", "Черновики", "Завершены"], examFilters: ["Текущие", "Лобби", "Черновики", "Завершённые", "Архив"], examNames: ["Линейные уравнения", "Дроби и проценты", "Функции и графики", "Квадратные уравнения"], examStatuses: ["Идёт экзамен", "Комплект готов", "Черновик", "Завершён"], examTasks: "заданий", variants: "вар.", minutes: "мин", libraryTag: "Библиотека", libraryNote: "Работы и их статусы приведены для примера.", emptyExams: "В этом разделе нет экзаменов",
  },
  en: {
    tabs: ["Center management", "Diagnostics", "Exams"], shortTabs: ["Center", "Diagnostics", "Exams"],
    workspace: "Platform overview", hint: "Explore the platform sections", demo: "Illustrative example",
    caption: "Simplified views of the ALGO interface. Data is shown for illustration.",
    center: "Demo center", navigation: "Navigation", dashboard: "Management dashboard", groups: "Groups", students: "Students", attendance: "Attendance", payments: "Payments", payroll: "Payroll", staff: "Staff", settings: "Account settings", roles: ["Owner", "Administrator", "Teacher"],
    teacherDashboard: "Dashboard", schedule: "Schedule", myGroups: "My groups", greeting: "Good afternoon, Owner", date: "18 October 2026", active: "System active", centerType: "Tutoring center",
    stats: ["Total students", "Staff members", "Completed diagnostics", "Average level (θ)"], leaders: "Academic leaders", leaderDesc: "Groups with the highest average level", risks: "At-risk groups", riskDesc: "Groups requiring attention", demoGroups: ["Group 01", "Group 02", "Group 03"], studentCount: "students",
    paymentDesc: "See who has paid for lessons and when payments expire", paymentTabs: ["Payment due", "Expiring soon", "No data", "Paid"], paymentHeaders: ["Student", "Group", "Per month", "Status", "Last payment"], student: "Student", paid: "Paid until 31 Oct 2026", payExpired: "Payment expired", payExpiring: "In 2 days", noData: "No data", currency: "UZS", search: "Student name or ID", searchExams: "Search...", total: "Total", empty: "Nothing found",
    report: "Diagnostic report", grade: "Grade 7", level: "Level", levelStatus: "Partial gaps", solved: "14 of 20 tasks solved", correct: "Correct", wrong: "Errors", reportTabs: ["Error journal", "Skill analysis", "Learning plan"],
    reportSection: "Report sections", linear: "Linear equations", statement: "Task statement", solve: "Solve the equation", answer: "Student answer", rightAnswer: "Correct answer", recordNote: "Journal excerpt · one example answer", exampleResponse: "The selected answer is recorded alongside the correct option.",
    boundary: "Academic knowledge boundary", foundation: "Foundation", foundationDesc: "Topics with correct answers.", foundationSkill: "Integer operations", currentErrors: "Errors in the current grade", currentErrorsDesc: "Current-grade skills where errors occurred.", route: "Individual learning route", routeDesc: "A prioritized plan for the identified skills.", start: "Starting point", structure: "Track structure", stages: "2 learning stages", planNames: ["Linear equations", "Equations with brackets"], planDescriptions: ["Review equation transformations and verify the root by substitution.", "Apply transformations to an equation with brackets."],
    library: "Exam library", libraryDesc: "Manage exams and templates", examStats: ["Current", "In lobby", "Drafts", "Completed"], examFilters: ["Current", "Lobby", "Drafts", "Completed", "Archive"], examNames: ["Linear equations", "Fractions and percentages", "Functions and graphs", "Quadratic equations"], examStatuses: ["Exam in progress", "Print set ready", "Draft", "Completed"], examTasks: "tasks", variants: "variants", minutes: "min", libraryTag: "Library", libraryNote: "Example exams and statuses for demonstration.", emptyExams: "No exams in this section",
  },
  uz: {
    tabs: ["Markaz boshqaruvi", "Diagnostika", "Imtihonlar"], shortTabs: ["Markaz", "Diagnostika", "Imtihonlar"],
    workspace: "Platforma bilan tanishuv", hint: "Platforma boʻlimlarini koʻring", demo: "Namoyish namunasi",
    caption: "ALGO interfeysining soddalashtirilgan koʻrinishi. Maʼlumotlar namuna uchun berilgan.",
    center: "Demo markaz", navigation: "Navigatsiya", dashboard: "Boshqaruv paneli", groups: "Guruhlar", students: "Oʻquvchilar", attendance: "Davomat", payments: "Toʻlovlar", payroll: "Ish haqi", staff: "Xodimlar", settings: "Hisob sozlamalari", roles: ["Egasi", "Administrator", "Oʻqituvchi"],
    teacherDashboard: "Boshqaruv paneli", schedule: "Jadval", myGroups: "Mening guruhlarim", greeting: "Xayrli kun, Markaz egasi", date: "2026-yil 18-oktabr", active: "Tizim faol", centerType: "Repetitorlik markazi",
    stats: ["Jami oʻquvchilar", "Xodimlar", "Yakunlangan diagnostikalar", "Oʻrtacha daraja (θ)"], leaders: "Oʻzlashtirish yetakchilari", leaderDesc: "Eng yuqori oʻrtacha darajali guruhlar", risks: "Eʼtibor talab qiladigan guruhlar", riskDesc: "Eʼtibor talab qiladigan guruhlar", demoGroups: ["01-guruh", "02-guruh", "03-guruh"], studentCount: "oʻquvchi",
    paymentDesc: "Kim darslar uchun toʻlagani va toʻlov qachon tugashini koʻring", paymentTabs: ["Toʻlov zarur", "Tez orada tugaydi", "Maʼlumot yoʻq", "Toʻlangan"], paymentHeaders: ["Oʻquvchi", "Guruh", "Oyiga", "Holat", "Oxirgi toʻlov"], student: "Oʻquvchi", paid: "31.10.2026 gacha toʻlangan", payExpired: "Toʻlov muddati tugagan", payExpiring: "2 kundan soʻng", noData: "Maʼlumot yoʻq", currency: "soʻm", search: "Oʻquvchi ismi yoki ID", searchExams: "Qidirish...", total: "Jami", empty: "Hech narsa topilmadi",
    report: "Diagnostika hisoboti", grade: "7-sinf", level: "Daraja", levelStatus: "Qisman boʻshliqlar", solved: "20 topshiriqdan 14 tasi toʻgʻri yechilgan", correct: "Toʻgʻri", wrong: "Xatolar", reportTabs: ["Xatolar jurnali", "Koʻnikmalar tahlili", "Oʻquv rejasi"],
    reportSection: "Hisobot boʻlimlari", linear: "Chiziqli tenglamalar", statement: "Topshiriq sharti", solve: "Tenglamani yeching", answer: "Oʻquvchi javobi", rightAnswer: "Toʻgʻri javob", recordNote: "Jurnaldan namuna · bitta javob", exampleResponse: "Tanlangan javob toʻgʻri variant bilan birga jurnalda saqlanadi.",
    boundary: "Akademik bilim chegarasi", foundation: "Tayanch bilimlar", foundationDesc: "Toʻgʻri javoblar berilgan mavzular.", foundationSkill: "Butun sonlar bilan amallar", currentErrors: "Joriy sinfdagi xatolar", currentErrorsDesc: "Joriy sinfda xato qilingan koʻnikmalar.", route: "Individual taʼlim yoʻnalishi", routeDesc: "Aniqlangan koʻnikmalarni ustuvorlik tartibida oʻrganish rejasi.", start: "Boshlangʻich nuqta", structure: "Yoʻnalish tuzilishi", stages: "2 ta oʻzlashtirish bosqichi", planNames: ["Chiziqli tenglamalar", "Qavsli tenglamalar"], planDescriptions: ["Tenglamani almashtirish va ildizni oʻrniga qoʻyib tekshirishni koʻrib chiqish.", "Qavsli tenglamalarda almashtirishlarni qoʻllash."],
    library: "Imtihonlar kutubxonasi", libraryDesc: "Imtihonlar va shablonlarni boshqaring", examStats: ["Joriy", "Kutish xonasida", "Qoralamalar", "Yakunlangan"], examFilters: ["Joriy", "Kutish xonasi", "Qoralamalar", "Yakunlangan", "Arxiv"], examNames: ["Chiziqli tenglamalar", "Kasrlar va foizlar", "Funksiyalar va grafiklar", "Kvadrat tenglamalar"], examStatuses: ["Imtihon davom etmoqda", "Chop etish toʻplami tayyor", "Qoralama", "Yakunlangan"], examTasks: "topshiriq", variants: "variant", minutes: "daq", libraryTag: "Kutubxona", libraryNote: "Imtihonlar va holatlar namoyish uchun keltirilgan.", emptyExams: "Bu boʻlimda imtihonlar yoʻq",
  },
};

type ScreenCopy = typeof copy.ru;
const tabIcons = [LayoutDashboard, Search, FileText];
const reportIcons = [FileText, GitBranch, ListChecks];
const examItems = [
  { index: 0, filter: 0, tone: "green", tasks: 12, variants: 1, minutes: 40 },
  { index: 1, filter: 0, tone: "violet", tasks: 10, variants: 1, minutes: 25 },
  { index: 2, filter: 2, tone: "amber", tasks: 8, variants: 1, minutes: 35 },
  { index: 3, filter: 3, tone: "slate", tasks: 12, variants: 1, minutes: 40 },
];

function SectionTabs({ labels, value, onChange, label, icons, className = "" }: {
  labels: string[]; value: number; onChange: (index: number) => void; label: string;
  icons?: typeof reportIcons; className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % labels.length;
    else if (event.key === "ArrowLeft") next = (index + labels.length - 1) % labels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = labels.length - 1;
    else return;
    event.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  }
  // These are view filters within the active product panel, not another page navigation.
  return <div className={`pw-view-tabs ${className}`} role="group" aria-label={label}>
    {labels.map((text, index) => {
      const Icon = icons?.[index];
      return <button type="button" key={text} ref={el => { refs.current[index] = el; }}
        aria-pressed={value === index} onKeyDown={event => onKeyDown(event, index)}
        onClick={() => onChange(index)} className={value === index ? "pw-view-active" : ""}>
        {Icon && <Icon size={14} />}<span>{text}</span>
      </button>;
    })}
  </div>;
}

function CenterOverview({ c }: { c: ScreenCopy }) {
  const icons = [Users, Shield, Brain, Activity];
  return <>
    <div className="pw-page-heading"><h3>{c.greeting}</h3><p><CalendarDays size={13} />{c.date}</p></div>
    <div className="pw-owner-hero">
      <span className="pw-system-status"><i />{c.active}</span>
      <h4>{c.center}</h4><p className="pw-center-type"><Building2 size={13} />{c.centerType}</p>
      <div className="pw-owner-stats">{c.stats.map((text, index) => {
        const Icon = icons[index];
        return <div key={text}><span className="pw-stat-icon"><Icon size={17} /></span><strong>{["248", "8", "32", "+0.20"][index]}</strong><span>{text}</span></div>;
      })}</div>
    </div>
    <div className="pw-group-cards">
      {[0, 1].map(index => {
        const Icon = index === 0 ? Trophy : AlertCircle;
        return <div className={`pw-group-card ${index ? "pw-risk" : "pw-leader"}`} key={index}>
          <div className="pw-card-title"><span className="pw-group-icon"><Icon size={19} /></span><div><h4>{index ? c.risks : c.leaders}</h4><p>{index ? c.riskDesc : c.leaderDesc}</p></div></div>
          <div className="pw-group-row"><div><strong>{c.demoGroups[index]}</strong><span><Users size={11} />{index ? "8" : "12"} {c.studentCount}</span></div><b>θ = {index ? "−1.00" : "0.80"}</b></div>
        </div>;
      })}
    </div>
  </>;
}

function Payments({ c }: { c: ScreenCopy }) {
  const [bucket, setBucket] = useState(0);
  const [search, setSearch] = useState("");
  // A student has one fixed payment state on the example date. Filters never change a record.
  const rows = [
    { studentId: 1, group: 0, bucket: 3, lastPayment: "01.10.2026" },
    { studentId: 2, group: 1, bucket: 0, lastPayment: "01.09.2026" },
    { studentId: 3, group: 2, bucket: 1, lastPayment: "21.09.2026" },
    { studentId: 4, group: 0, bucket: 2, lastPayment: null },
  ];
  const shown = rows.filter(row => row.bucket === bucket && `${c.student} 0${row.studentId} ID 00${row.studentId}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <>
    <div className="pw-page-heading"><h3>{c.payments}</h3><p>{c.paymentDesc}</p></div>
    <SectionTabs labels={c.paymentTabs} value={bucket} onChange={setBucket} label={c.payments} />
    <label className="pw-search"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={c.search} aria-label={c.search} /></label>
    <div className="pw-payments-table-wrap"><table className="pw-payments-table"><thead><tr>{c.paymentHeaders.map(text => <th key={text} scope="col">{text}</th>)}</tr></thead>
      <tbody>{shown.map(row => <tr key={row.studentId}><th scope="row"><span className="pw-student-name">{c.student} 0{row.studentId}</span><small>ID 00{row.studentId}</small></th><td>{c.demoGroups[row.group]}</td><td><strong>500 000</strong><small>{c.currency}</small></td><td><span className={`pw-badge pw-tone-${["rose", "amber", "slate", "green"][row.bucket]}`}>{[c.payExpired, c.payExpiring, c.noData, c.paid][row.bucket]}</span></td><td>{row.lastPayment === null ? "—" : <><span>{row.lastPayment}</span><small>500 000 {c.currency}</small></>}</td></tr>)}</tbody>
    </table>{shown.length === 0 && <p className="pw-empty">{c.empty}</p>}</div>
    <p className="pw-content-note">{c.total}: {shown.length}</p>
  </>;
}

function DiagnosticReport({ c }: { c: ScreenCopy }) {
  const [section, setSection] = useState(0);
  return <>
    <div className="pw-page-heading pw-report-heading"><ArrowLeft size={16} aria-hidden="true" /><div><h3>{c.report}</h3><p>{c.student} 01 · {c.grade}</p></div></div>
    <div className="pw-score-card">
      <div className="pw-level-ring" aria-hidden="true"><Activity size={27} /><span>{c.level}</span></div>
      <div className="pw-score-info"><span className="pw-level-badge"><i />{c.levelStatus}</span><p>{c.solved}</p></div>
      <div className="pw-score-counts"><div><CheckCircle2 size={18} /><span><strong>14</strong>{c.correct}</span></div><div><XCircle size={18} /><span><strong>6</strong>{c.wrong}</span></div></div>
    </div>
    <SectionTabs labels={c.reportTabs} value={section} onChange={setSection} label={c.reportSection} icons={reportIcons} className="pw-report-tabs" />
    <div className="pw-report-content" aria-live="polite">
      {section === 0 && <div className="pw-journal">
        <div className="pw-journal-header"><span><FileText size={16} /></span><h4>{c.reportTabs[0]}</h4><small>№ 1</small></div>
        <div className="pw-journal-entry"><p className="pw-entry-skill"><span>№ 1</span>{c.linear}</p>
          <div className="pw-question"><span>{c.statement}</span><p>{c.solve}: <b className="pw-math">2x + 1 = 7</b></p></div>
          <div className="pw-answer-comparison"><div><span><XCircle size={12} />{c.answer}</span><strong className="pw-math">x = 4</strong></div><div><span><CheckCircle2 size={12} />{c.rightAnswer}</span><strong className="pw-math">x = 3</strong></div></div>
          <p className="pw-content-note">{c.recordNote}</p>
        </div>
      </div>}
      {section === 1 && <div className="pw-boundary pw-surface"><h4><Target size={16} />{c.boundary}</h4><div className="pw-boundary-grid">
        <div><h5><Anchor size={15} />{c.foundation}</h5><p>{c.foundationDesc}</p><span className="pw-badge pw-tone-green">{c.foundationSkill}</span></div>
        <div><h5><AlertCircle size={15} />{c.currentErrors}</h5><p>{c.currentErrorsDesc}</p><span className="pw-badge pw-tone-rose">{c.linear}</span></div>
      </div></div>}
      {section === 2 && <>
        <div className="pw-route-summary pw-surface"><h4><ListChecks size={16} />{c.route}</h4><p>{c.routeDesc}</p><div><span>{c.structure}<strong>{c.stages}</strong></span><span>{c.start}<strong>{c.linear}</strong></span></div></div>
        <div className="pw-route-steps">{c.planNames.map((name, index) => <div key={name}><span>{index + 1}</span><div><h4>{name}</h4><p>{c.planDescriptions[index]}</p></div></div>)}</div>
      </>}
    </div>
  </>;
}

function ExamLibrary({ c }: { c: ScreenCopy }) {
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState("");
  const icons = [Activity, Users, AlertCircle, XCircle];
  const filtered = examItems.filter(item => item.filter === filter && c.examNames[item.index].toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <>
    <div className="pw-page-heading"><h3>{c.library}</h3><p>{c.libraryDesc}</p></div>
    <div className="pw-exam-stats">{c.examStats.map((label, index) => {
      const Icon = icons[index];
      return <div className={`pw-tone-${["green", "violet", "amber", "slate"][index]}`} key={label}><span><Icon size={16} /></span><div><strong>{[2, 0, 1, 1][index]}</strong><p>{label}</p></div></div>;
    })}</div>
    <div className="pw-library-controls"><SectionTabs labels={c.examFilters} value={filter} onChange={setFilter} label={c.library} /><label className="pw-search"><Search size={14} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={c.searchExams} aria-label={c.searchExams} /></label></div>
    <div className="pw-exam-list" aria-live="polite">{filtered.length === 0 ? <div className="pw-exams-empty"><BookOpen size={30} /><p>{search ? c.empty : c.emptyExams}</p></div> : filtered.map(item => <div className="pw-exam-card" key={item.index}>
      <span className={`pw-exam-icon pw-tone-${item.tone}`}><FileText size={21} /></span>
      <div className="pw-exam-info"><div><h4>{c.examNames[item.index]}</h4><span className={`pw-badge pw-tone-${item.tone}`}><i />{c.examStatuses[item.index]}</span></div>
        <span className="pw-exam-group"><Users size={11} />{item.index === 2 ? c.libraryTag : c.demoGroups[item.index % 3]}</span>
        <div className="pw-exam-meta"><span><BookOpen size={12} />{item.tasks} {c.examTasks}</span><span><Library size={12} />{item.variants} {c.variants}</span><span><Clock size={12} />{item.minutes} {c.minutes}</span></div>
      </div>
    </div>)}</div>
    <p className="pw-content-note">{c.libraryNote}</p>
  </>;
}

export interface ProductWorkbenchProps { activeTab?: number; onTabChange?: (index: number) => void; }

export default function ProductWorkbench({ activeTab: controlledTab, onTabChange }: ProductWorkbenchProps = {}) {
  const { locale } = useTranslation();
  const c = copy[locale];
  const [internalTab, setInternalTab] = useState(0);
  const [centerPage, setCenterPage] = useState(0);
  const rawTab = controlledTab ?? internalTab;
  const activeTab = Number.isFinite(rawTab) ? Math.max(0, Math.min(2, Math.trunc(rawTab))) : 0;
  const reducedMotion = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  function selectTab(index: number) { setInternalTab(index); onTabChange?.(index); }
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % 3;
    else if (event.key === "ArrowLeft") next = (index + 2) % 3;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 2;
    else return;
    event.preventDefault(); selectTab(next); tabRefs.current[next]?.focus();
  }
  const ownerNav = [{ label: c.dashboard, Icon: LayoutDashboard, page: 0 }, { label: c.groups, Icon: Users }, { label: c.students, Icon: GraduationCap }, { label: c.attendance, Icon: ClipboardCheck }, { label: c.payments, Icon: Wallet, page: 1 }, { label: c.payroll, Icon: Banknote }, { label: c.staff, Icon: Shield }];
  const adminNav = [{ label: c.tabs[1], Icon: Search, selected: true }, { label: c.tabs[2], Icon: FileText }, { label: c.students, Icon: GraduationCap }, { label: c.groups, Icon: Users }, { label: c.attendance, Icon: ClipboardCheck }, { label: c.payments, Icon: Wallet }];
  const teacherNav = [{ label: c.teacherDashboard, Icon: LayoutDashboard }, { label: c.schedule, Icon: CalendarDays }, { label: c.tabs[2], Icon: FileText, selected: true }, { label: c.myGroups, Icon: Users }];
  const navigation: { label: string; Icon: typeof LayoutDashboard; page?: number; selected?: boolean }[] = [ownerNav, adminNav, teacherNav][activeTab];

  return <figure className="pw-workbench">
    <div className="pw-switcher-row"><div className="pw-tabs" role="tablist" aria-label={c.workspace}>{c.tabs.map((label, index) => {
      const Icon = tabIcons[index];
      return <button key={label} type="button" ref={el => { tabRefs.current[index] = el; }} id={`${id}-tab-${index}`} role="tab" aria-selected={activeTab === index} aria-controls={`${id}-panel-${index}`} tabIndex={activeTab === index ? 0 : -1} onKeyDown={event => onTabKeyDown(event, index)} onClick={() => selectTab(index)} className={`pw-tab ${activeTab === index ? "pw-tab-active" : ""}`}><Icon size={15} /><span className="pw-tab-full">{label}</span><span className="pw-tab-short">{c.shortTabs[index]}</span></button>;
    })}</div><span className="pw-demo-label"><span />{c.demo}</span></div>
    <div className="pw-window">
      <aside className="pw-sidebar" aria-label={c.navigation}>
        <div className="pw-brand"><span className="pw-brand-integral" aria-hidden="true">∫</span><div><strong>ALGO</strong><span><Building2 size={10} />{c.center}</span></div></div>
        <span className="pw-nav-label">{c.navigation}</span>
        <div className="pw-side-nav">{navigation.map(({ label, Icon, page, selected }) => {
          const isSelected = activeTab === 0 ? centerPage === page : selected;
          const body = <><Icon size={17} /><span>{label}</span></>;
          return page !== undefined ? <button type="button" key={label} className={`pw-side-item ${isSelected ? "pw-side-active" : ""}`} aria-label={label} title={label} aria-pressed={isSelected} onClick={() => setCenterPage(page)}>{body}</button> : <div key={label} title={label} className={`pw-side-item ${isSelected ? "pw-side-active" : ""}`}>{body}</div>;
        })}</div>
        <div className="pw-sidebar-bottom"><div className="pw-side-item"><Settings size={16} /><span>{c.settings}</span></div><div className="pw-profile"><span className="pw-profile-avatar">A</span><div><strong>{c.roles[activeTab]}</strong><span>{c.center}</span></div><ChevronDown size={13} /></div></div>
      </aside>
      <div className="pw-main"><AnimatePresence mode="wait" initial={false}><motion.div key={`${activeTab}-${centerPage}`} id={`${id}-panel-${activeTab}`} role="tabpanel" aria-labelledby={`${id}-tab-${activeTab}`} tabIndex={0} className="pw-panel" initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }} transition={{ duration: reducedMotion ? 0 : .18 }}>
        {activeTab === 0 ? centerPage === 0 ? <CenterOverview c={c} /> : <Payments c={c} /> : activeTab === 1 ? <DiagnosticReport c={c} /> : <ExamLibrary c={c} />}
      </motion.div></AnimatePresence></div>
    </div>
    <figcaption className="pw-caption">{c.caption}</figcaption>
  </figure>;
}
