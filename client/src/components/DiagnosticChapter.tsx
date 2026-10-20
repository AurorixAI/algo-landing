import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  Activity, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, FileText,
  GitBranch, GraduationCap, Link2, ListChecks, Search, Target, Users, X,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAmbientMotion } from "./AmbientMotion";
import { useContactForm } from "./ContactForm";
import SectionAtmosphere from "./SectionAtmosphere";
import "./diagnostic-chapter.css";

// Report structure: released frontend c15fc867, admin/diagnostics/[id]/report.
// The equation and options come from demo/scripts/build-fixtures.mjs (G7_P08).
// This is a public educational illustration, never a real student's attempt.
// Deep Scan intentionally shows the mechanism, not an invented prerequisite edge.
const copy = {
  ru: {
    kicker: "03 / ДИАГНОСТИКА", title: "Понять, что ученик решает сейчас.", titleAccent: "Увидеть, с чего начать дальше.",
    intro: "Адаптивная диагностика по математике для 5–11 классов. От конкретных ответов — к навыкам, учебному старту и разговору с преподавателем.",
    flowTitles: ["Начать по ссылке", "Пройти свой набор заданий", "Продолжить с преподавателем"],
    flowDescriptions: ["Ученик проходит диагностику в браузере. Команда видит её статус.", "Следующее задание подбирается по ходу диагностики, с учётом ответов.", "Отчёт помогает выбрать учебный старт. Группу назначает сотрудник центра."],
    demo: "Показать диагностику моему центру", demoContext: "Хочу посмотреть диагностику и отчёт ALGO.",
    report: "Отчёт диагностики", grade: "Сардор Абдуллаев · 7 класс", example: "Учебный пример", scenario: "Результат", scenarios: ["С ошибкой", "Без ошибок"],
    tabs: ["Журнал ошибок", "Анализ навыков", "План обучения"], tabsLabel: "Разделы примера отчёта", linear: "Линейные уравнения", taskNumber: "Задание 01", solve: "Решите уравнение", options: "Варианты ответа", answer: "Ответ ученика", rightAnswer: "Верный ответ", check: "Проверка примера:",
    noErrorsTitle: "Все выполненные задания решены верно.",
    observationLabel: "Навык в показанном задании", observationDescription: "Ответ x = 4 не удовлетворяет уравнению. Это наблюдение для разбора с преподавателем.",
    scanTitle: "Как работает Deep Scan", scanNodes: ["Исходный навык", "Связанный базовый навык"],
    scanSteps: ["Основание для проверки", "Связанный базовый навык", "Последовательность ответов"],
    scanDescriptions: ["При необходимости ALGO запускает углублённую проверку по ответам ученика.", "Дополнительный вопрос проверяет связанную опору в знаниях.", "Преподаватель видит условие, ответ и результат каждого проверенного шага."],
    achievementTitle: "В этом примере ответ верный.",
    planLabel: "Стартовая точка", developmentLabel: "Следующий шаг развития", planTitle: "Начать с линейных уравнений.", developmentTitle: "Двигаться к более сложным задачам.",
    planSteps: ["Разобрать преобразования", "Проверить самостоятельное решение"],
    planStepDescriptions: ["Из 2x + 1 = 7 получить 2x = 6 и x = 3. Проверить корень подстановкой.", "Решить другое линейное уравнение и объяснить каждый переход. По ответу определить следующий шаг."],
    developmentSteps: ["Расширить освоенный навык", "Обсудить результат с преподавателем"],
    developmentStepDescriptions: ["Попробовать более сложные задания по линейным уравнениям и проверить решения.", "Выбрать дальнейшие задания по тому, как ученик справился с новой сложностью."],
    handoff: "Дальше — решение команды", teacher: "Преподаватель", teacherAction: "Выбирает учебный старт", administrator: "Администратор", administratorAction: "Выбирает группу вручную",
  },
  en: {
    kicker: "03 / DIAGNOSTICS", title: "See what a student can solve.", titleAccent: "Know where to begin next.",
    intro: "Adaptive mathematics diagnostics for grades 5–11. From specific answers to skills, a learning starting point and a conversation with the teacher.",
    flowTitles: ["Start with a link", "Follow an adaptive set of tasks", "Continue with the teacher"],
    flowDescriptions: ["The student works in a browser. Your team can see the diagnostic status.", "The next task is selected as the diagnostic progresses, taking answers into account.", "The report helps identify a learning starting point. A staff member chooses the group."],
    demo: "Show diagnostics to my centre", demoContext: "I would like to explore ALGO diagnostics and its report.",
    report: "Diagnostic report", grade: "Sardor Abdullayev · Grade 7", example: "Educational example", scenario: "Result", scenarios: ["With an error", "No errors"],
    tabs: ["Error journal", "Skill analysis", "Learning plan"], tabsLabel: "Example report sections", linear: "Linear equations", taskNumber: "Task 01", solve: "Solve the equation", options: "Answer options", answer: "Student answer", rightAnswer: "Correct answer", check: "Checking this example:",
    noErrorsTitle: "All completed tasks were solved correctly.",
    observationLabel: "Skill in the illustrated task", observationDescription: "The answer x = 4 does not satisfy the equation. This is an observation to discuss with the teacher.",
    scanTitle: "How Deep Scan works", scanNodes: ["Initial skill", "Related prerequisite skill"],
    scanSteps: ["A reason to check further", "A related prerequisite skill", "The sequence of answers"],
    scanDescriptions: ["When needed, ALGO uses the student's answers to initiate a deeper check.", "An additional question checks a related foundation in the student's knowledge.", "The teacher can see the question, answer and outcome of each checked step."],
    achievementTitle: "The answer in this example is correct.",
    planLabel: "Starting point", developmentLabel: "Next development step", planTitle: "Start with linear equations.", developmentTitle: "Move on to more challenging tasks.",
    planSteps: ["Review the transformations", "Check an independent solution"],
    planStepDescriptions: ["Transform 2x + 1 = 7 into 2x = 6 and x = 3. Verify the root by substitution.", "Solve another linear equation and explain every step. Use the answer to decide what comes next."],
    developmentSteps: ["Extend the skill", "Discuss the result with the teacher"],
    developmentStepDescriptions: ["Try more challenging linear equations and check the solutions.", "Choose further tasks based on how the student handles the new level of difficulty."],
    handoff: "The team decides what comes next", teacher: "Teacher", teacherAction: "Chooses a learning starting point", administrator: "Administrator", administratorAction: "Chooses the group manually",
  },
  uz: {
    kicker: "03 / DIAGNOSTIKA", title: "O‘quvchi hozir nimani yecha olishini biling.", titleAccent: "Keyingi qadamni belgilang.",
    intro: "5–11-sinflar uchun matematika bo‘yicha adaptiv diagnostika. Aniq javoblardan — ko‘nikmalar, ta’limni boshlash nuqtasi va o‘qituvchi bilan suhbatgacha.",
    flowTitles: ["Havola orqali boshlash", "Moslashtirilgan topshiriqlarni bajarish", "O‘qituvchi bilan davom etish"],
    flowDescriptions: ["O‘quvchi diagnostikadan brauzerda o‘tadi. Jamoa uning holatini ko‘radi.", "Keyingi topshiriq diagnostika davomida, javoblarni hisobga olgan holda tanlanadi.", "Hisobot ta’limni boshlash nuqtasini tanlashga yordam beradi. Guruhni markaz xodimi tanlaydi."],
    demo: "Markazimga diagnostikani ko‘rsatish", demoContext: "ALGO diagnostikasi va uning hisobotini ko‘rmoqchiman.",
    report: "Diagnostika hisoboti", grade: "Sardor Abdullayev · 7-sinf", example: "O‘quv namunasi", scenario: "Natija", scenarios: ["Xato bilan", "Xatosiz"],
    tabs: ["Xatolar jurnali", "Ko‘nikmalar tahlili", "O‘quv rejasi"], tabsLabel: "Hisobot namunasi bo‘limlari", linear: "Chiziqli tenglamalar", taskNumber: "01-topshiriq", solve: "Tenglamani yeching", options: "Javob variantlari", answer: "O‘quvchi javobi", rightAnswer: "To‘g‘ri javob", check: "Namunani tekshirish:",
    noErrorsTitle: "Bajarilgan barcha topshiriqlar to‘g‘ri yechilgan.",
    observationLabel: "Ko‘rsatilgan topshiriqdagi ko‘nikma", observationDescription: "x = 4 javobi tenglamani qanoatlantirmaydi. Buni o‘qituvchi bilan tahlil qilish mumkin.",
    scanTitle: "Deep Scan qanday ishlaydi", scanNodes: ["Boshlang‘ich ko‘nikma", "Bog‘liq tayanch ko‘nikma"],
    scanSteps: ["Tekshiruv uchun asos", "Bog‘liq tayanch ko‘nikma", "Javoblar ketma-ketligi"],
    scanDescriptions: ["Zarur bo‘lganda ALGO o‘quvchi javoblari asosida chuqurlashtirilgan tekshiruvni boshlaydi.", "Qo‘shimcha savol bilimdagi bog‘liq tayanch ko‘nikmani tekshiradi.", "O‘qituvchi har bir tekshirilgan qadamning sharti, javobi va natijasini ko‘radi."],
    achievementTitle: "Bu namunada javob to‘g‘ri.",
    planLabel: "Boshlash nuqtasi", developmentLabel: "Keyingi rivojlanish qadami", planTitle: "Chiziqli tenglamalardan boshlash.", developmentTitle: "Murakkabroq topshiriqlarga o‘tish.",
    planSteps: ["Almashtirishlarni tahlil qilish", "Mustaqil yechimni tekshirish"],
    planStepDescriptions: ["2x + 1 = 7 dan 2x = 6 va x = 3 ni olish. Ildizni o‘rniga qo‘yib tekshirish.", "Boshqa chiziqli tenglamani yechish va har bir qadamni tushuntirish. Javob asosida keyingi qadamni belgilash."],
    developmentSteps: ["O‘zlashtirilgan ko‘nikmani kengaytirish", "Natijani o‘qituvchi bilan muhokama qilish"],
    developmentStepDescriptions: ["Chiziqli tenglamalar bo‘yicha murakkabroq topshiriqlarni sinab ko‘rish va yechimlarni tekshirish.", "O‘quvchi yangi murakkablikni qanday yengganiga qarab keyingi topshiriqlarni tanlash."],
    handoff: "Keyingi qarorni jamoa qabul qiladi", teacher: "O‘qituvchi", teacherAction: "Ta’limni boshlash nuqtasini tanlaydi", administrator: "Administrator", administratorAction: "Guruhni qo‘lda tanlaydi",
  },
};

type ChapterCopy = typeof copy.ru;
const tabIcons = [FileText, GitBranch, ListChecks];
const flowIcons = [Link2, Activity, GraduationCap];
const answerOptions = ["3", "4", "2", "8"];

function Journal({ c, error }: { c: ChapterCopy; error: boolean }) {
  if (!error) return <>
    <div className="diag-achievement"><CheckCircle2 aria-hidden="true" /><h4>{c.noErrorsTitle}</h4></div>
    <div className="diag-journal-next"><span>{c.developmentLabel}</span><strong>{c.developmentTitle}</strong></div>
  </>;

  return <>
    <div className="diag-task-line"><span><FileText aria-hidden="true" />{c.taskNumber}</span><span>·</span><span>{c.linear}</span></div>
    <p className="diag-task-prompt">{c.solve}</p>
    <div className="diag-equation">2<var>x</var> + 1 = 7</div>
    <ul className="diag-options" aria-label={c.options}>
      {answerOptions.map((answer, index) => <li key={answer} className={`diag-option ${answer === "3" ? "diag-option-correct" : ""} ${error && answer === "4" ? "diag-option-selected" : ""}`}>
        <small>{String.fromCharCode(65 + index)}</small><span>{answer}</span>{answer === "3" ? <Check aria-hidden="true" /> : error && answer === "4" ? <X aria-hidden="true" /> : null}
      </li>)}
    </ul>
    <div className="diag-answer-grid">
      <div className={error ? "diag-answer-error" : "diag-answer-correct"}>
        <span className="diag-answer-label">{error ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}{c.answer}</span>
        <div className="diag-answer-number"><var>x</var> = {error ? "4" : "3"}</div>
      </div>
      <div className="diag-answer-correct"><span className="diag-answer-label"><Check aria-hidden="true" />{c.rightAnswer}</span><div className="diag-answer-number"><var>x</var> = 3</div></div>
    </div>
    <p className="diag-check">{c.check} <strong>{error ? "2 · 4 + 1 = 9 ≠ 7" : "2 · 3 + 1 = 7"}</strong></p>
  </>;
}

function SkillAnalysis({ c, error, scanId }: { c: ChapterCopy; error: boolean; scanId: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!error) return <>
    <div className="diag-achievement"><CheckCircle2 aria-hidden="true" /><h4>{c.achievementTitle}</h4><div className="diag-equation">2 · 3 + 1 = 7</div></div>
  </>;

  return <>
    <div className="diag-observation"><Target aria-hidden="true" /><div><small>{c.observationLabel}</small><h4>{c.linear}</h4><p>{c.observationDescription}</p></div></div>
    <div className="diag-scan">
      <button type="button" className="diag-scan-trigger" aria-expanded={expanded} aria-controls={scanId} onClick={() => setExpanded(current => !current)}>
        <GitBranch aria-hidden="true" /><span><strong>{c.scanTitle}</strong></span><ChevronDown aria-hidden="true" className="diag-scan-chevron" />
      </button>
      <div className="diag-scan-illustration" aria-hidden="true"><span className="diag-scan-node"><Target />{c.scanNodes[0]}</span><ArrowRight className="diag-scan-arrow" /><span className="diag-scan-node"><GitBranch />{c.scanNodes[1]}</span></div>
      <div id={scanId} className="diag-scan-detail" hidden={!expanded}>
        <ol>{c.scanSteps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span><div><strong>{step}</strong><p>{c.scanDescriptions[index]}</p></div></li>)}</ol>
      </div>
    </div>
  </>;
}

function LearningPlan({ c, error }: { c: ChapterCopy; error: boolean }) {
  const names = error ? c.planSteps : c.developmentSteps;
  const descriptions = error ? c.planStepDescriptions : c.developmentStepDescriptions;
  return <>
    <span className="diag-plan-label"><Target aria-hidden="true" />{error ? c.planLabel : c.developmentLabel}</span>
    <h4>{error ? c.planTitle : c.developmentTitle}</h4>
    <ol className="diag-plan-steps">{names.map((name, index) => <li key={name}><span aria-hidden="true">0{index + 1}</span><div><h5>{name}</h5><p>{descriptions[index]}</p></div></li>)}</ol>
    <div className="diag-handoff"><p>{c.handoff}</p><div className="diag-handoff-roles">
      <div className="diag-handoff-person"><GraduationCap aria-hidden="true" /><div><strong>{c.teacher}</strong><span>{c.teacherAction}</span></div></div>
      <ArrowRight aria-hidden="true" />
      <div className="diag-handoff-person"><Users aria-hidden="true" /><div><strong>{c.administrator}</strong><span>{c.administratorAction}</span></div></div>
    </div></div>
  </>;
}

export default function DiagnosticChapter() {
  const { locale } = useTranslation();
  const { paused } = useAmbientMotion();
  const { open } = useContactForm();
  const c = copy[locale];
  const id = useId();
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % c.tabs.length;
    else if (event.key === "ArrowLeft") next = (index + c.tabs.length - 1) % c.tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = c.tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  return <section id="diagnostics" className="diag-chapter" aria-labelledby={`${id}-heading`}>
    <SectionAtmosphere variant="path" paused={paused} />
    <div className="shell"><div className="diag-layout">
      <div className="diag-editorial">
        <span className="diag-kicker">{c.kicker}</span>
        <h2 id={`${id}-heading`}>{c.title}<br /><span>{c.titleAccent}</span></h2>
        <p className="diag-intro">{c.intro}</p>
        <ol className="diag-flow">{c.flowTitles.map((title, index) => {
          const Icon = flowIcons[index];
          return <li key={title}><span className="diag-flow-icon"><Icon aria-hidden="true" /></span><div><strong>{title}</strong><p>{c.flowDescriptions[index]}</p></div></li>;
        })}</ol>
        <button type="button" className="diag-demo-link" onClick={() => open("demo", c.demoContext)}>{c.demo}<ArrowRight aria-hidden="true" /></button>
      </div>
      <div className="diag-product">
        <div className="diag-report-top"><span className="diag-report-mark"><Activity aria-hidden="true" /></span><div><h3>{c.report}</h3><p>{c.grade}</p></div><span className="diag-example-tag">{c.example}</span></div>
        <div className="diag-scenario"><span>{c.scenario}</span><div className="diag-scenario-buttons" role="group" aria-label={c.scenario}>
          {c.scenarios.map((scenario, index) => <button type="button" key={scenario} aria-pressed={error === (index === 0)} onClick={() => setError(index === 0)}>{scenario}</button>)}
        </div></div>
        <div role="tablist" aria-label={c.tabsLabel} className="diag-tabs">
          {c.tabs.map((tab, index) => {
            const Icon = tabIcons[index];
            return <button key={tab} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={activeTab === index} tabIndex={activeTab === index ? 0 : -1} ref={element => { tabRefs.current[index] = element; }} onClick={() => setActiveTab(index)} onKeyDown={event => onTabKeyDown(event, index)}><Icon aria-hidden="true" /><span>{tab}</span></button>;
          })}
        </div>
        {c.tabs.map((_, index) => <div key={index} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={activeTab !== index} tabIndex={0} className="diag-tab-content">
          {activeTab === index && (index === 0 ? <Journal c={c} error={error} /> : index === 1 ? <SkillAnalysis c={c} error={error} scanId={`${id}-scan`} /> : <LearningPlan c={c} error={error} />)}
        </div>)}

      </div>
    </div></div>
  </section>;
}
