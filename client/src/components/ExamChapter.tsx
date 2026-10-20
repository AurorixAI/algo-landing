import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowRight, BookOpen, Check, CheckCheck, ClipboardList, Clock3, Copy, FileDown, FileText, GraduationCap, Layers3, Play, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAmbientMotion } from "./AmbientMotion";
import { useContactForm } from "./ContactForm";
import SectionAtmosphere from "./SectionAtmosphere";
import "./exam-chapter.css";
import ExamPreparation, { ExamEquation } from "./ExamPreparation";
import { getPreparationQuestion, initialPreparation, preparationQuestions } from "./exam-preparation-data";

const copy = {
  ru: {
    eyebrow: "02 / ЭКЗАМЕНЫ И БИБЛИОТЕКА",
    title: "Экзамены. От подготовки до разбора ответов.",
    description: "Сохраните работу, проверьте задания, проведите с группой и разберите ответы. Каждый этап помогает подготовиться к следующему уроку.",
    tabs: ["Библиотека", "Подготовка", "Проведение", "Результаты"],
    titles: ["Подготовить один раз. Использовать снова.", "Содержание — под контролем преподавателя.", "Одна работа. Два способа провести.", "После баллов — материал для следующего урока."],
    descriptions: ["Сохраните шаблон без группы. Сделайте копию и назначьте на конкретное занятие — прежние проведения останутся в истории.", "Выберите темы или параграфы, настройте сложность и время. Просмотрите задания и замените нужные перед проведением.", "Онлайн — приглашение по ссылке или QR, общий старт и собранные ответы. На бумаге — бланк ученика и отдельный ключ преподавателя.", "В онлайн-работе видно, как справилась группа и где чаще ошибались. Общий отчёт помогает спланировать разбор, а сохранённая работа готова к новому проведению."],
    proofs: ["Копия получает свои группу, занятие и результаты. История исходной работы сохраняется.", "В подборе есть задания для 5–11 классов. Доступность тем и параграфов зависит от наполнения банка.", "Формат определяет результат: онлайн-ответы собираются в ALGO; бумажную работу проверяет преподаватель.", "Результаты и общий педагогический отчёт относятся к онлайн-проведению. Решение о следующем уроке принимает преподаватель."],
    template: "Библиотечный шаблон",
    saved: "Сохранён",
    examTitle: "Действия с дробями",
    grade: "6 класс",
    tasks: "5 заданий",
    duration: "45 минут",
    withoutGroup: "Без группы и занятия",
    createCopy: "Создать копию",
    copyCreated: "Новый черновик с теми же заданиями",
    editableCopy: "Копия для следующего занятия",
    ownResults: "Отдельное проведение и свои результаты",
    assign: "Назначить группе",
    assigned: "6-Б · 20 октября, 14:00",
    assignedLabel: "Назначено на занятие",
    history: "6-А · проведено ранее · результаты сохранены",
    preview: "Конструктор работы",
    instruction: "Выполните действие:",
    online: "Онлайн",
    print: "На бумаге",
    lobby: "Комната ожидания",
    group: "6-А · пример проведения",
    groupCopy: "6-Б · пример проведения",
    connected: "8 учеников подключились",
    running: "Работа началась",
    working: "8 учеников выполняют задания",
    participantExcerpt: "Участники · показаны 4 из 8",
    ended: "Работа завершена",
    received: "Ответы переданы преподавателю",
    timer: "Общий таймер",
    ready: "Подключён",
    solving: "Выполняет",
    submitted: "Сдал",
    start: "Начать в примере",
    finish: "Завершить в примере",
    viewResults: "Посмотреть результаты",
    onlineNote: "Общий непрерывный таймер, автосохранение ответов. Ключи закрыты до общего завершения работы.",
    printTitle: "Бланк ученика",
    keyTitle: "Ключ преподавателя",
    nameLine: "Имя: __________________",
    sample: "Учебный образец",
    printNote: "Место для решения и отдельная страница с ответами. Откройте настоящий двухстраничный образец.",
    pdf: "Открыть образец PDF · RU",
    report: "Общий отчёт группы",
    allSubmitted: "работ сдано",
    problemTask: "Задание для совместного разбора",
    errorCount: "3 из 8 ответов — неверные",
    recommendation: "На следующем уроке: повторить приведение дробей к общему знаменателю, разобрать ответы и проверить на новом примере.",
    mixedRecommendation: "На следующем уроке: повторить сложение смешанных чисел с одинаковыми знаменателями, разобрать ответы и проверить на новом примере.",
    again: "Сделать копию для новой группы",
    preserved: "Результаты этого проведения остаются в истории.",
    cta: "Показать экзамены для нашего центра",
    request: "Хочу посмотреть экзамены: библиотеку, подготовку, проведение и результаты.",
  },
  en: {
    eyebrow: "02 / EXAMS & LIBRARY",
    title: "Exams. From preparation to answer review.",
    description: "Save a paper, review its questions, run it with a group and examine the answers. Each step helps prepare the next lesson.",
    tabs: ["Library", "Preparation", "Delivery", "Results"],
    titles: ["Prepare once. Use again.", "Teachers stay in control of the content.", "One paper. Two ways to run it.", "Beyond the score: a starting point for the next lesson."],
    descriptions: ["Save a template without a group. Make a copy and assign it to a specific lesson, keeping previous sittings in the history.", "Choose topics or textbook sections, then set difficulty and time. Review the questions and replace individual tasks before delivery.", "Online: invite by link or QR, start together and collect answers. On paper: a student worksheet and a separate teacher’s key.", "An online sitting shows how the group performed and where errors were common. A group report supports lesson planning, while the saved paper is ready to use again."],
    proofs: ["Each copy has its own group, lesson and results. The original sitting’s history is preserved.", "Question selection covers grades 5–11. Available topics and textbook sections depend on the question bank.", "The format determines the outcome: ALGO collects online answers; teachers mark paper worksheets.", "Results and the group teaching report apply to online sittings. Teachers decide what comes next."],
    template: "Library template", saved: "Saved", examTitle: "Operations with fractions", grade: "Grade 6", tasks: "5 questions", duration: "45 minutes", withoutGroup: "No group or lesson", createCopy: "Make a copy", copyCreated: "New draft with the same questions", editableCopy: "Copy for the next lesson", ownResults: "A separate sitting with its own results", assign: "Assign to a group", assigned: "6-B · 20 October, 14:00", assignedLabel: "Assigned to a lesson", history: "6-A · previous sitting · results preserved",
    preview: "Paper builder", instruction: "Calculate:", online: "Online", print: "On paper", lobby: "Waiting room", group: "6-A · example sitting", groupCopy: "6-B · example sitting", connected: "8 students connected", running: "Assessment started", working: "8 students working", participantExcerpt: "Participants · showing 4 of 8", ended: "Assessment finished", received: "Answers sent to the teacher", timer: "Shared timer", ready: "Connected", solving: "Working", submitted: "Submitted", start: "Start the example", finish: "Finish the example", viewResults: "View results", onlineNote: "One continuous timer and answer autosave. Answer keys stay closed until the sitting ends for everyone.",
    printTitle: "Student worksheet", keyTitle: "Teacher’s key", nameLine: "Name: __________________", sample: "Teaching sample", printNote: "Space for working and a separate answer page. Open the actual two-page sample.", pdf: "Open sample PDF · RU",
    report: "Group report", allSubmitted: "papers submitted", problemTask: "A question to review together", errorCount: "3 of 8 answers were incorrect", recommendation: "Next lesson: revisit common denominators, discuss the answers and check understanding with a new example.", mixedRecommendation: "Next lesson: revisit mixed-number addition with equal denominators, discuss the answers and check understanding with a new example.", again: "Make a copy for another group", preserved: "This sitting’s results remain in the history.", cta: "Show exams for our centre", request: "I’d like to explore exams: the library, preparation, delivery and results.",
  },
  uz: {
    eyebrow: "02 / IMTIHONLAR VA KUTUBXONA",
    title: "Imtihonlar. Tayyorlashdan javoblar tahliligacha.",
    description: "Ishni saqlang, topshiriqlarni tekshiring, guruh bilan o‘tkazing va javoblarni tahlil qiling. Har bir bosqich keyingi darsga tayyorlanishga yordam beradi.",
    tabs: ["Kutubxona", "Tayyorlash", "O‘tkazish", "Natijalar"],
    titles: ["Bir marta tayyorlang. Qayta foydalaning.", "Mazmun o‘qituvchi nazoratida.", "Bitta ish. O‘tkazishning ikki usuli.", "Balldan keyin — keyingi dars uchun material."],
    descriptions: ["Shablonni guruhsiz saqlang. Nusxa yarating va aniq darsga tayinlang — avvalgi o‘tkazishlar tarixda qoladi.", "Mavzular yoki paragraflarni tanlang, qiyinlik va vaqtni belgilang. O‘tkazishdan oldin topshiriqlarni ko‘rib chiqing va keraklisini almashtiring.", "Onlayn — havola yoki QR orqali taklif, umumiy start va yig‘ilgan javoblar. Qog‘ozda — o‘quvchi blankasi va o‘qituvchi uchun alohida javoblar kaliti.", "Onlayn ishda guruh natijasi va ko‘p xato qilingan topshiriqlar ko‘rinadi. Guruh hisoboti keyingi darsni rejalashga yordam beradi, saqlangan ish esa qayta o‘tkazishga tayyor."],
    proofs: ["Nusxaning o‘z guruhi, darsi va natijalari bo‘ladi. Asl ishning tarixi saqlanadi.", "5–11-sinflar uchun topshiriqlar tanlanadi. Mavzu va paragraflar mavjudligi bankning to‘ldirilishiga bog‘liq.", "Format natijani belgilaydi: onlayn javoblarni ALGO yig‘adi, qog‘oz ishni o‘qituvchi tekshiradi.", "Natijalar va umumiy pedagogik hisobot onlayn o‘tkazishga tegishli. Keyingi dars bo‘yicha qarorni o‘qituvchi qabul qiladi."],
    template: "Kutubxona shabloni", saved: "Saqlangan", examTitle: "Kasrlar ustida amallar", grade: "6-sinf", tasks: "5 topshiriq", duration: "45 daqiqa", withoutGroup: "Guruh va darssiz", createCopy: "Nusxa yaratish", copyCreated: "Bir xil topshiriqli yangi qoralama", editableCopy: "Keyingi dars uchun nusxa", ownResults: "Alohida o‘tkazish va o‘z natijalari", assign: "Guruhga tayinlash", assigned: "6-B · 20-oktabr, 14:00", assignedLabel: "Darsga tayinlandi", history: "6-A · avval o‘tkazilgan · natijalar saqlangan",
    preview: "Ishni tayyorlash", instruction: "Amalni bajaring:", online: "Onlayn", print: "Qog‘ozda", lobby: "Kutish xonasi", group: "6-A · o‘tkazish namunasi", groupCopy: "6-B · o‘tkazish namunasi", connected: "8 o‘quvchi ulandi", running: "Ish boshlandi", working: "8 o‘quvchi ishlamoqda", participantExcerpt: "Ishtirokchilar · 8 tadan 4 tasi ko‘rsatilgan", ended: "Ish yakunlandi", received: "Javoblar o‘qituvchiga yuborildi", timer: "Umumiy taymer", ready: "Ulangan", solving: "Ishlamoqda", submitted: "Topshirdi", start: "Namunani boshlash", finish: "Namunani yakunlash", viewResults: "Natijalarni ko‘rish", onlineNote: "Umumiy uzluksiz taymer va javoblarni avtomatik saqlash. Kalitlar hamma uchun ish tugaguncha yopiq.",
    printTitle: "O‘quvchi blankasi", keyTitle: "O‘qituvchi uchun kalit", nameLine: "Ism: __________________", sample: "O‘quv namunasi", printNote: "Yechish uchun joy va javoblar yozilgan alohida sahifa. Haqiqiy ikki sahifali namunani oching.", pdf: "PDF namunasini ochish · RU",
    report: "Guruhning umumiy hisoboti", allSubmitted: "ish topshirilgan", problemTask: "Birgalikda tahlil qilish uchun topshiriq", errorCount: "8 javobdan 3 tasi noto‘g‘ri", recommendation: "Keyingi darsda: kasrlarni umumiy maxrajga keltirishni takrorlash, javoblarni muhokama qilish va yangi misolda tekshirish.", mixedRecommendation: "Keyingi darsda: maxrajlari bir xil aralash sonlarni qo‘shishni takrorlash, javoblarni muhokama qilish va yangi misolda tekshirish.", again: "Yangi guruh uchun nusxa yaratish", preserved: "Bu o‘tkazishning natijalari tarixda qoladi.", cta: "Markazimiz uchun imtihonlarni ko‘rsatish", request: "Imtihonlarni ko‘rmoqchiman: kutubxona, tayyorlash, o‘tkazish va natijalar.",
  },
};

export default function ExamChapter() {
  const { locale } = useTranslation();
  const c = copy[locale];
  const { paused } = useAmbientMotion();
  const { open } = useContactForm();
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [hasCopy, setHasCopy] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [preparation, setPreparation] = useState(initialPreparation);
  const [reportQuestion, setReportQuestion] = useState(preparationQuestions.common[0]);
  const [format, setFormat] = useState<"online" | "print">("online");
  const [phase, setPhase] = useState<"lobby" | "running" | "ended">("lobby");
  const [runningCopy, setRunningCopy] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);

  useEffect(() => {
    if (phase !== "running") return;
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, 45 * 60 - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) setPhase("ended");
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  const timerLabel = `${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}`;

  function createCopy() {
    setHasCopy(true);
    setAssigned(false);
    setPhase("lobby");
    setSecondsRemaining(45 * 60);
  }

  function selectStep(next: number, focus = false) {
    setStep(next);
    if (focus) tabRefs.current[next]?.focus();
  }
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % 4;
    else if (event.key === "ArrowLeft") next = (index + 3) % 4;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 3;
    else return;
    event.preventDefault();
    selectStep(next, true);
  }

  const deliveryTitle = format === "print" ? c.printTitle : phase === "lobby" ? c.lobby : phase === "running" ? c.running : c.ended;
  const sceneTitle = [c.template, c.preview, deliveryTitle, c.report][step];
  const sceneIcon = [<BookOpen size={16} />, <ClipboardList size={16} />, <GraduationCap size={16} />, <FileText size={16} />][step];

  return <section id="exams" className="exam-chapter" aria-labelledby={`${id}-heading`}>
    <SectionAtmosphere variant="paper" paused={paused} />
    <div className="exam-chapter-shell">
      <div className="exam-chapter-intro">
        <p className="exam-chapter-eyebrow"><BookOpen size={14} aria-hidden="true" />{c.eyebrow}</p>
        <h2 id={`${id}-heading`}>{c.title}</h2>
        <p>{c.description}</p>
      </div>
      <div className="exam-step-tabs" role="tablist" aria-label={c.eyebrow}>
        {c.tabs.map((label, index) => <button key={index} ref={node => { tabRefs.current[index] = node; }} type="button" className="exam-step-tab" role="tab" aria-selected={step === index} aria-controls={`${id}-panel-${index}`} id={`${id}-tab-${index}`} tabIndex={step === index ? 0 : -1} onClick={() => selectStep(index)} onKeyDown={event => onTabKey(event, index)}><span aria-hidden="true">0{index + 1}</span><span>{label}</span></button>)}
      </div>
      <div className={`exam-step-layout${step === 1 ? " exam-step-layout-preparation" : ""}`} role="tabpanel" id={`${id}-panel-${step}`} aria-labelledby={`${id}-tab-${step}`} tabIndex={0}>
        <div className="exam-step-copy">
          <p className="exam-step-counter" aria-hidden="true">0{step + 1} / 04</p>
          <h3>{c.titles[step]}</h3>
          <p className="exam-step-description">{c.descriptions[step]}</p>
          {step !== 0 && <p className="exam-step-proof"><ShieldCheck size={14} aria-hidden="true" /><span>{c.proofs[step]}</span></p>}
        </div>
        <div className="exam-scene-wrap">
          <p className="exam-example-data">{locale === "ru" ? "Имена и результаты участников в примерах вымышлены." : locale === "uz" ? "Namunalardagi ishtirokchilarning ismlari va natijalari to‘qima." : "Participant names and results in these examples are fictional."}</p>
          <div className="exam-scene" key={step}>
            <div className="exam-scene-head"><h4>{sceneTitle}</h4><span aria-hidden="true">{sceneIcon}</span></div>
            <div className="exam-scene-body">
              {step === 0 && <>
                <div className="exam-template">
                  <div className="exam-template-title"><span className="exam-badge exam-badge-blue"><Layers3 size={10} aria-hidden="true" />{c.saved}</span><BookOpen size={18} aria-hidden="true" /></div>
                  <h5>{c.examTitle}</h5>
                  <div className="exam-template-meta"><span>{c.grade}</span><span>{c.tasks}</span><span>{c.duration}</span></div>
                  <p className="exam-label">{c.withoutGroup}</p>
                  <button className="exam-action" type="button" onClick={createCopy}><Copy size={12} aria-hidden="true" />{c.createCopy}</button>
                </div>
                {hasCopy && <div aria-live="polite"><p className="exam-copy-flow"><ArrowDown size={13} aria-hidden="true" />{c.copyCreated}</p><div className="exam-copy-card"><div><p>{c.editableCopy}</p><small>{assigned ? c.assignedLabel : c.ownResults}</small></div>{assigned ? <span className="exam-assigned"><CheckCheck size={13} aria-hidden="true" />{c.assigned}</span> : <button className="exam-action exam-action-primary" type="button" onClick={() => setAssigned(true)}>{c.assign}<ArrowRight size={12} aria-hidden="true" /></button>}</div></div>}
                <p className="exam-online-foot"><Check size={11} aria-hidden="true" /> {c.history}</p>
              </>}
              {step === 1 && <ExamPreparation locale={locale} selection={preparation} onChange={setPreparation} />}
              {step === 2 && <>
                <div className="exam-format-tabs" aria-label={c.tabs[2]}><button type="button" aria-pressed={format === "online"} onClick={() => setFormat("online")}>{c.online}</button><button type="button" aria-pressed={format === "print"} onClick={() => setFormat("print")}>{c.print}</button></div>
                {format === "online" ? <>
                  <div className="exam-running-status"><div aria-live="polite"><p className="exam-label">{(phase === "lobby" ? assigned : runningCopy) ? c.groupCopy : c.group}</p><strong>{phase === "lobby" ? c.connected : phase === "running" ? c.running : c.ended}</strong><small>{phase === "lobby" ? c.lobby : phase === "running" ? c.working : c.received}</small></div><div><p className="exam-label">{c.timer}</p><span className="exam-clock"><Clock3 size={13} aria-hidden="true" />{timerLabel}</span></div></div>
                  <p className="exam-label">{c.participantExcerpt}</p><div className="exam-participants">{(locale === "ru" ? ["Мадина Юсупова", "Рустам Алиев", "Шохрух Усманов", "Нилуфар Саидова"] : ["Madina Yusupova", "Rustam Aliyev", "Shohruh Usmonov", "Nilufar Saidova"]).map((name, number) => <div className="exam-participant" key={name}><span className="exam-avatar" aria-hidden="true">{name.split(" ").map(part => part[0]).join("")}</span><span>{name}</span><small>{phase === "lobby" ? c.ready : phase === "running" ? c.solving : c.submitted}</small></div>)}</div>
                  {phase === "lobby" ? <button type="button" className="exam-action exam-action-primary" onClick={() => { setReportQuestion(getPreparationQuestion(preparation)); setRunningCopy(assigned); setPhase("running"); }}><Play size={12} aria-hidden="true" />{c.start}</button> : phase === "running" ? <button type="button" className="exam-action exam-action-primary" onClick={() => setPhase("ended")}>{c.finish}<Check size={12} aria-hidden="true" /></button> : <button type="button" className="exam-action exam-action-primary" onClick={() => selectStep(3, true)}>{c.viewResults}<ArrowRight size={12} aria-hidden="true" /></button>}
                  <p className="exam-online-foot">{c.onlineNote}</p>
                </> : <>
                  <div className="exam-print-spread" aria-hidden="true"><div className="exam-print-page"><div className="exam-print-brand">∫ ALGO</div><h5>{c.examTitle}</h5><p>{c.grade} · {c.sample}</p><p>{c.nameLine}</p><div className="exam-print-line" /><p>01 · {c.instruction}</p><div className="exam-print-formula">⅓ + ⅕ =</div><div className="exam-print-grid" /><p style={{ marginTop: 13 }}>02 · {c.instruction}</p><div className="exam-print-formula">2½ + 3½ =</div></div><div className="exam-print-page exam-print-page-key"><div className="exam-print-brand">∫ ALGO</div><h5>{c.keyTitle}</h5><p>{c.sample}</p><div className="exam-print-line" /><div className="exam-print-formula">01 · 8/15</div><div className="exam-print-formula">02 · 6</div></div></div>
                  <p className="exam-online-foot" style={{ marginBottom: 14 }}>{c.printNote}</p><a className="exam-action exam-action-primary" href="/samples/algo-exam-sample.pdf" target="_blank" rel="noopener"><FileDown size={12} aria-hidden="true" />{c.pdf}</a>
                </>}
              </>}
              {step === 3 && <>
                <p className="exam-result-context">{phase === "ended" ? (runningCopy ? c.groupCopy : c.group) : locale === "ru" ? "Пример завершённой работы · 6-А" : locale === "uz" ? "Yakunlangan ish namunasi · 6-A" : "Completed sitting example · 6-A"}</p>
                <div className="exam-result-metrics" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}><div className="exam-result-metric"><strong>8 / 8</strong><span>{c.allSubmitted}</span></div></div>
                <div className="exam-report-title"><FileText size={13} aria-hidden="true" />{c.problemTask}</div>
                <div className="exam-report-question"><p>{c.instruction}</p><ExamEquation question={reportQuestion} /><div className="exam-report-bar" aria-hidden="true"><span /></div><small>{c.errorCount}</small></div>
                <p className="exam-report-recommendation">{reportQuestion.scope === "mixed" ? c.mixedRecommendation : c.recommendation}</p>
                <button type="button" className="exam-action" onClick={() => { createCopy(); selectStep(0, true); }}><Copy size={12} aria-hidden="true" />{c.again}</button><p className="exam-online-foot">{c.preserved}</p>
              </>}
            </div>
          </div>

        </div>
      </div>
      <div className="exam-chapter-bottom"><button className="exam-chapter-cta" type="button" onClick={() => open("demo", c.request)}>{c.cta}<ArrowRight size={14} aria-hidden="true" /></button></div>
    </div>
  </section>;
}
