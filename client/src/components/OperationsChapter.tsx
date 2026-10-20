import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Check, CheckCircle2, Clock3, FileCheck2, History, Layers3, Play, ShieldCheck, UserRound, Users, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import "./operations-chapter.css";

const copy = {
  ru: {
    kicker: "04 / Работа центра", title: "За каждым уроком —", accent: "целая история.", intro: "Ученик, его группы и занятия связаны. Команда видит контекст и доводит каждое действие до результата.",
    steps: ["Ученик и группы", "Ближайший урок", "Журнал и решения"],
    descriptions: ["Один профиль, несколько групп. Прошлая работа остаётся в истории.", "Плановое время и фактическое проведение — разные состояния.", "Понятные отметки и отдельное решение по уважительному пропуску."],
    continuity: "Учебная история остаётся с командой при переводе или возвращении ученика.",
    brand: "Рабочий день", demo: "Интерактивный пример", student: "Азиза Каримова", profile: "Профиль ученика · 8 класс", groups: "Обучение в группах", algebra: "Алгебра · 8 класс", geometry: "Геометрия · 8 класс", teacher: "Дилшод Рахимов", active: "В группе", another: "Показать вторую группу", hideGroup: "Свернуть вторую группу", history: "История обучения", dates: ["17 сент.", "1 окт.", "8 окт."], events: ["Диагностика и отчёт", "Зачислен в группу алгебры", "Добавлена геометрия"],
    lesson: "Ближайшее занятие", date: "18 октября 2026", planned: "Запланирован", running: "Идёт урок", done: "Завершён", lessonTime: "Время в расписании", lessonNote: "Урок начинается и завершается действием преподавателя. Журнал относится к фактически проведённому занятию.", start: "Начать урок в примере", openJournal: "Открыть журнал", journal: "Журнал занятия", journalMeta: "Алгебра · 18 октября · 14:00–15:30", mark: "Отметка преподавателя", attendance: ["Был", "Опоздал", "Не был", "Уважительная"],
    reason: "Причина уважительного пропуска", reasonPlaceholder: "Например, справка о болезни", submitReason: "Передать администратору", admin: "Теперь — администратор", pending: "Ожидает решения", approved: "Подтверждён", rejected: "Отклонён", approve: "Подтвердить", reject: "Отклонить", reviewText: "Преподаватель указывает причину. Администратор проверяет её и принимает решение.", confirmedText: "Уважительная причина подтверждена администратором.", rejectedText: "Причина отклонена. В журнале остаётся решение администратора.",
    finish: "Завершить урок", completed: "Урок завершён. Журнал сохранён.", finishNote: "Выберите отметку. Для уважительного пропуска сначала укажите причину.", lockedNote: "Исправления завершённого журнала выполняются отдельно, с причиной и автором.", needsStart: "Сначала начните занятие", needsStartText: "Запланированный урок ещё не является проведённым. Откройте ближайшее занятие и нажмите «Начать».", backLesson: "К ближайшему уроку", footer: "Интерактивный пример · изменения только на этой странице", reset: "Начать заново",
  },
  en: {
    kicker: "04 / Daily operations", title: "Every lesson has", accent: "a story behind it.", intro: "Students, groups and lessons stay connected. Your team keeps the context and follows each action through.",
    steps: ["Student and groups", "Next lesson", "Attendance and decisions"], descriptions: ["One profile, multiple groups. Previous work stays in the history.", "A scheduled time and a completed lesson are different states.", "Clear attendance marks and a separate decision on an excused absence."], continuity: "The learning history stays with the team when a student transfers or returns.",
    brand: "A working day", demo: "Interactive example", student: "Aziza Karimova", profile: "Student profile · Grade 8", groups: "Group enrollment", algebra: "Algebra · Grade 8", geometry: "Geometry · Grade 8", teacher: "Dilshod Rahimov", active: "Enrolled", another: "Show the second group", hideGroup: "Hide the second group", history: "Learning history", dates: ["17 Sep", "1 Oct", "8 Oct"], events: ["Assessment and report", "Joined the algebra group", "Added the geometry group"],
    lesson: "Next lesson", date: "18 October 2026", planned: "Scheduled", running: "In progress", done: "Completed", lessonTime: "Scheduled time", lessonNote: "The teacher starts and finishes the lesson explicitly. Attendance belongs to the lesson that actually took place.", start: "Start the sample lesson", openJournal: "Open attendance", journal: "Lesson attendance", journalMeta: "Algebra · 18 October · 14:00–15:30", mark: "Teacher’s mark", attendance: ["Present", "Late", "Absent", "Excused"],
    reason: "Reason for an excused absence", reasonPlaceholder: "For example, a medical certificate", submitReason: "Send to administrator", admin: "Now — the administrator", pending: "Awaiting decision", approved: "Approved", rejected: "Rejected", approve: "Approve", reject: "Reject", reviewText: "The teacher provides a reason. An administrator reviews it and makes a decision.", confirmedText: "The administrator approved the reason for absence.", rejectedText: "The reason was rejected. The administrator’s decision remains in the record.",
    finish: "Finish lesson", completed: "Lesson completed. Attendance saved.", finishNote: "Choose a mark. For an excused absence, provide a reason first.", lockedNote: "Changes to a completed record require a separate correction with a reason and author.", needsStart: "Start the lesson first", needsStartText: "A scheduled lesson has not yet taken place. Open the next lesson and choose Start.", backLesson: "Back to the next lesson", footer: "Interactive example · changes stay on this page", reset: "Start again",
  },
  uz: {
    kicker: "04 / Markazning kundalik ishi", title: "Har bir dars ortida —", accent: "yaxlit tarix.", intro: "O‘quvchi, uning guruhlari va darslari o‘zaro bog‘langan. Jamoa vaziyatni biladi va har bir ishni natijaga yetkazadi.",
    steps: ["O‘quvchi va guruhlar", "Eng yaqin dars", "Jurnal va qarorlar"], descriptions: ["Bitta profil, bir nechta guruh. Avvalgi ishlar tarixda saqlanadi.", "Jadvaldagi vaqt va amalda o‘tilgan dars — alohida holatlar.", "Aniq davomat belgilari va uzrli qoldirish bo‘yicha alohida qaror."], continuity: "O‘quvchi boshqa guruhga o‘tganda yoki qaytganda ta’lim tarixi jamoada qoladi.",
    brand: "Bir ish kuni", demo: "Interaktiv namuna", student: "Aziza Karimova", profile: "O‘quvchi profili · 8-sinf", groups: "Guruhlarda ta’lim", algebra: "Algebra · 8-sinf", geometry: "Geometriya · 8-sinf", teacher: "Dilshod Rahimov", active: "Guruhda", another: "Ikkinchi guruhni ko‘rsatish", hideGroup: "Ikkinchi guruhni yig‘ish", history: "Ta’lim tarixi", dates: ["17 sent.", "1 okt.", "8 okt."], events: ["Diagnostika va hisobot", "Algebra guruhiga qabul qilindi", "Geometriya guruhi qo‘shildi"],
    lesson: "Eng yaqin dars", date: "2026-yil 18-oktabr", planned: "Rejalashtirilgan", running: "Dars davom etmoqda", done: "Yakunlangan", lessonTime: "Jadvaldagi vaqt", lessonNote: "Darsni o‘qituvchi boshlaydi va yakunlaydi. Jurnal amalda o‘tilgan darsga tegishli bo‘ladi.", start: "Namunadagi darsni boshlash", openJournal: "Jurnalni ochish", journal: "Dars jurnali", journalMeta: "Algebra · 18-oktabr · 14:00–15:30", mark: "O‘qituvchi belgisi", attendance: ["Keldi", "Kechikdi", "Kelmadi", "Uzrli"],
    reason: "Uzrli qoldirish sababi", reasonPlaceholder: "Masalan, tibbiy ma’lumotnoma", submitReason: "Administratorga yuborish", admin: "Endi — administrator", pending: "Qaror kutilmoqda", approved: "Tasdiqlandi", rejected: "Rad etildi", approve: "Tasdiqlash", reject: "Rad etish", reviewText: "O‘qituvchi sababni ko‘rsatadi. Administrator uni tekshirib, qaror qabul qiladi.", confirmedText: "Qoldirish sababi administrator tomonidan tasdiqlandi.", rejectedText: "Sabab rad etildi. Administrator qarori jurnalda saqlanadi.",
    finish: "Darsni yakunlash", completed: "Dars yakunlandi. Jurnal saqlandi.", finishNote: "Davomat belgisini tanlang. Uzrli qoldirish uchun avval sababni yozing.", lockedNote: "Yakunlangan jurnal alohida tuzatish orqali, sabab va muallif bilan o‘zgartiriladi.", needsStart: "Avval darsni boshlang", needsStartText: "Rejalashtirilgan dars hali o‘tilgan hisoblanmaydi. Eng yaqin darsni ochib, «Boshlash»ni bosing.", backLesson: "Eng yaqin darsga qaytish", footer: "Interaktiv namuna · o‘zgarishlar shu sahifada qoladi", reset: "Qaytadan boshlash",
  },
};

type LessonState = "planned" | "started" | "completed";
type ReviewState = "pending" | "approved" | "rejected";

/** Local, explicitly marked demonstration of the shipped student / lesson / attendance workflow. */
export default function OperationsChapter() {
  const { locale } = useTranslation();
  const c = copy[locale];
  const [step, setStep] = useState(0);
  const [secondGroup, setSecondGroup] = useState(true);
  const [history, setHistory] = useState(false);
  const [lesson, setLesson] = useState<LessonState>("planned");
  const [attendance, setAttendance] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState<ReviewState>("pending");
  useEffect(() => {
    const syncAnchor = () => {
      const hash = window.location.hash;
      if (hash === "#students") setStep(0);
      else if (hash === "#lessons") setStep(1);
      else if (hash === "#attendance") setStep(2);
    };
    syncAnchor();
    window.addEventListener("hashchange", syncAnchor);
    return () => window.removeEventListener("hashchange", syncAnchor);
  }, []);
  const selectStep = (nextStep: number) => {
    setStep(nextStep);
    const hash = ["#students", "#lessons", "#attendance"][nextStep];
    if (window.location.hash !== hash) window.history.replaceState(window.history.state, "", hash);
  };
  const reset = () => { setLesson("planned"); setAttendance(null); setReason(""); setSubmitted(false); setReview("pending"); selectStep(0); setSecondGroup(true); setHistory(false); };
  const start = () => { setLesson("started"); selectStep(2); };
  const completed = lesson === "completed";
  const canFinish = attendance !== null && (attendance !== 3 || submitted);
  const status = lesson === "planned" ? c.planned : completed ? c.done : c.running;
  return <section id="operations" className="ops-chapter">
    <div className="shell">
      <div className="ops-heading"><div><span className="ops-kicker">{c.kicker}</span><h2>{c.title}<br /><span>{c.accent}</span></h2></div><p>{c.intro}</p></div>
      <div className="ops-layout">
        <div>
          <div className="ops-steps" role="group" aria-label={c.brand}>
            {c.steps.map((label, index) => <button id={["students", "lessons", "attendance"][index]} className="ops-step" key={label} aria-pressed={step === index} aria-controls="ops-demo-panel" onClick={() => selectStep(index)}><span className="ops-step-number">0{index + 1}</span><div><strong>{label}</strong><p>{c.descriptions[index]}</p></div><ArrowRight size={15} aria-hidden="true" /></button>)}
          </div>
          <p className="ops-continuity"><History size={15} aria-hidden="true" />{c.continuity}</p>
        </div>
        <div className="ops-demo" id="ops-demo-panel">
          <div className="ops-demo-bar"><span className="ops-demo-brand"><Layers3 size={15} aria-hidden="true" />{c.brand}</span><span>{c.demo}</span></div>
          <div className="ops-scene" key={step}>
            {step === 0 ? <>
              <div className="ops-person"><span className="ops-avatar" aria-hidden="true">АК</span><div><h3>{c.student}</h3><p>{c.profile}</p></div></div>
              <span className="ops-small-label">{c.groups}</span>
              <div className="ops-memberships">{[c.algebra, ...(secondGroup ? [c.geometry] : [])].map(group => <div className="ops-membership" key={group}><BookOpen size={18} aria-hidden="true" /><div><strong>{group}</strong><span>{c.teacher}</span></div><span><Check size={12} aria-hidden="true" />{c.active}</span></div>)}</div>
              <div className="ops-profile-actions"><button className="ops-inline-button" onClick={() => setSecondGroup(!secondGroup)} aria-expanded={secondGroup}><Users size={14} aria-hidden="true" />{secondGroup ? c.hideGroup : c.another}</button><button className="ops-inline-button" aria-expanded={history} onClick={() => setHistory(!history)}><History size={14} aria-hidden="true" />{c.history}</button></div>
              {history && <div className="ops-history">{c.events.map((event, i) => <div key={event}><time>{c.dates[i]}</time><strong>{event}</strong></div>)}</div>}
            </> : step === 1 ? <>
              <div className="ops-lesson-title"><div><span className="ops-small-label">{c.lesson}</span><h3>{c.algebra}</h3><p>{c.teacher}</p></div><span className={`ops-status ${completed ? "is-done" : lesson === "started" ? "is-active" : ""}`}>{status}</span></div>
              <div className="ops-time-block"><CalendarDays size={29} strokeWidth={1.5} aria-hidden="true" /><div><strong>14:00–15:30</strong><span>{c.date} · {c.lessonTime}</span></div></div>
              <p className="ops-lesson-note"><Clock3 size={16} aria-hidden="true" />{c.lessonNote}</p>
              <button className="ops-primary" onClick={lesson === "planned" ? start : () => selectStep(2)}>{lesson === "planned" ? <Play size={13} aria-hidden="true" /> : <FileCheck2 size={15} aria-hidden="true" />}{lesson === "planned" ? c.start : c.openJournal}<ArrowRight size={14} aria-hidden="true" /></button>
            </> : lesson === "planned" ? <>
              <div className="ops-person"><span className="ops-avatar"><Clock3 size={22} aria-hidden="true" /></span><div><h3>{c.needsStart}</h3><p>{c.journalMeta}</p></div></div><p className="ops-lesson-note">{c.needsStartText}</p><button className="ops-primary" onClick={() => selectStep(1)}>{c.backLesson}<ArrowRight size={14} aria-hidden="true" /></button>
            </> : <>
              <div className="ops-journal-head"><div><h3>{c.journal}</h3><p>{c.journalMeta}</p></div><span className={`ops-status ${completed ? "is-done" : "is-active"}`}>{status}</span></div>
              <div className="ops-student-row"><span className="ops-avatar" aria-hidden="true"><UserRound size={16} /></span><strong>{c.student}</strong><span>{c.mark}</span></div>
              <div className="ops-attendance" role="group" aria-label={c.mark}>{c.attendance.map((label, i) => <button key={label} aria-pressed={attendance === i} disabled={completed} onClick={() => { setAttendance(i); setSubmitted(false); setReview("pending"); }}>{[<Check size={13} key="present" />, <Clock3 size={13} key="late" />, <X size={13} key="absent" />, <ShieldCheck size={13} key="excused" />][i]}{label}</button>)}</div>
              {attendance === 3 && <div className="ops-excuse"><label htmlFor="ops-absence-reason">{c.reason}</label><textarea id="ops-absence-reason" value={reason} onChange={event => setReason(event.target.value)} disabled={submitted || completed} placeholder={c.reasonPlaceholder} maxLength={200} />{!submitted ? <button className="ops-inline-button" onClick={() => setSubmitted(true)} disabled={!reason.trim() || completed}>{c.submitReason}<ArrowRight size={13} aria-hidden="true" /></button> : <div className="ops-review"><div className="ops-review-head"><strong>{c.admin}</strong><span>{review === "pending" ? c.pending : review === "approved" ? c.approved : c.rejected}</span></div><p>{review === "pending" ? c.reviewText : review === "approved" ? c.confirmedText : c.rejectedText}</p>{review === "pending" && <div className="ops-review-actions"><button className="ops-inline-button" onClick={() => setReview("approved")}><Check size={13} aria-hidden="true" />{c.approve}</button><button className="ops-inline-button" onClick={() => setReview("rejected")}><X size={13} aria-hidden="true" />{c.reject}</button></div>}</div>}</div>}
              <div className="ops-record-foot">{completed ? <div className="ops-complete" role="status"><CheckCircle2 size={17} aria-hidden="true" />{c.completed}</div> : <button className="ops-primary" disabled={!canFinish} onClick={() => setLesson("completed")}><Check size={15} aria-hidden="true" />{c.finish}</button>}<span>{completed ? c.lockedNote : c.finishNote}</span></div>
            </>}
          </div>
          <div className="ops-demo-foot"><button onClick={reset}>{c.reset}</button></div>
        </div>
      </div>
    </div>
  </section>;
}
