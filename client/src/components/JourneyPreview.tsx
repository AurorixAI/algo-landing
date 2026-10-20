import { useState } from "react";
import { ArrowRight, BookOpen, Check, ClipboardList, FileText, Link2, ScanLine, Users, Wallet } from "lucide-react";
import type { Locale } from "@/i18n";
import "./journey-preview.css";

const copy = {
  ru: {
    label: "Схема процесса в ALGO", invitation: "Приглашение на диагностику", link: "Индивидуальная ссылка ученика",
    statuses: ["Ожидает подтверждения", "Готов к началу", "Проходит тест", "Завершён"],
    invitationNote: "Ученик открывает ссылку в браузере. В ALGO виден статус прохождения.",
    report: "Отчёт диагностики", tabs: ["Журнал ошибок", "Анализ навыков", "План обучения"],
    titles: ["Вернуться к конкретному ответу", "Увидеть основание вывода", "Выбрать следующий шаг"],
    texts: ["Задание, ответ ученика и объяснение собраны для разбора с преподавателем.", "Проверенные навыки и обнаруженные пробелы помогают разобраться в результате диагностики.", "План помогает определить, с каких тем начать дальнейшее обучение."],
    reportNote: "Учебное решение остаётся за преподавателем.",
    work: "После зачисления в группу", workItems: ["Группы", "Посещаемость", "Оплаты"],
    workDetails: ["Ученики и зачисления", "Занятия и отметки в журнале", "Периоды, пакеты и квитанции"],
    workNote: "Данные доступны команде в соответствии с ролью и выданными правами.",
  },
  en: {
    label: "The ALGO workflow", invitation: "Assessment invitation", link: "Individual student link",
    statuses: ["Awaiting confirmation", "Ready to start", "In progress", "Completed"],
    invitationNote: "The student opens the link in a browser. ALGO shows the assessment status.",
    report: "Assessment report", tabs: ["Error log", "Skill analysis", "Learning plan"],
    titles: ["Return to a specific answer", "See the basis for a finding", "Choose the next step"],
    texts: ["The question, student answer and explanation are collected for a review with the teacher.", "Assessed skills and identified gaps help explain the assessment result.", "The plan helps decide which topics to start with in further learning."],
    reportNote: "The teacher makes the learning decisions.",
    work: "After group enrollment", workItems: ["Groups", "Attendance", "Payments"],
    workDetails: ["Students and enrollment", "Lessons and class records", "Periods, packages and receipts"],
    workNote: "The team can access data according to their role and granted permissions.",
  },
  uz: {
    label: "ALGOdagi ish jarayoni", invitation: "Diagnostikaga taklif", link: "O‘quvchining shaxsiy havolasi",
    statuses: ["Tasdiqlash kutilmoqda", "Boshlashga tayyor", "Test davom etmoqda", "Yakunlangan"],
    invitationNote: "O‘quvchi havolani brauzerda ochadi. ALGOda diagnostika holati ko‘rinadi.",
    report: "Diagnostika hisoboti", tabs: ["Xatolar jurnali", "Ko‘nikmalar tahlili", "Ta’lim rejasi"],
    titles: ["Muayyan javobga qaytish", "Xulosa asosini ko‘rish", "Keyingi qadamni tanlash"],
    texts: ["Topshiriq, o‘quvchi javobi va izoh o‘qituvchi bilan tahlil qilish uchun jamlangan.", "Tekshirilgan ko‘nikmalar va aniqlangan bo‘shliqlar diagnostika natijasini tushunishga yordam beradi.", "Reja keyingi ta’limni qaysi mavzulardan boshlashni belgilashga yordam beradi."],
    reportNote: "Ta’lim bo‘yicha qarorni o‘qituvchi qabul qiladi.",
    work: "Guruhga qabul qilingandan so‘ng", workItems: ["Guruhlar", "Davomat", "To‘lovlar"],
    workDetails: ["O‘quvchilar va qabul", "Darslar va jurnal belgilari", "Davrlar, paketlar va kvitansiyalar"],
    workNote: "Jamoa ma’lumotlarni roli va berilgan huquqlariga muvofiq ko‘radi.",
  },
};

/** A process illustration using shipped ALGO states and sections, without synthetic scores. */
export default function JourneyPreview({ step, locale }: { step: number; locale: Locale }) {
  const c = copy[locale];
  const [reportTab, setReportTab] = useState(0);
  return <div className="flow-preview">
    <span className="screen-eyebrow mono">{c.label}</span>
    {step === 0 ? <>
      <h3>{c.invitation}</h3>
      <div className="flow-link"><span className="flow-icon"><Link2 size={19} /></span><div><span>{c.link}</span><code>algolab.me/d/…</code></div></div>
      <ol className="flow-statuses">{c.statuses.map((status, i) => <li key={status} className={i === 2 ? "current" : i < 2 ? "passed" : ""}><span>{i < 2 ? <Check size={12} /> : i + 1}</span><span>{status}</span>{i === 2 && <i aria-hidden="true" />}</li>)}</ol>
      <p className="flow-note">{c.invitationNote}</p>
    </> : step === 1 ? <>
      <h3>{c.report}</h3>
      <div className="flow-report-tabs" role="group" aria-label={c.report}>{c.tabs.map((tab, i) => <button key={tab} aria-pressed={reportTab === i} onClick={() => setReportTab(i)}>{tab}</button>)}</div>
      <div className="flow-report-content" aria-live="polite"><span className="flow-icon">{[<ClipboardList key="c" />, <ScanLine key="s" />, <BookOpen key="b" />][reportTab]}</span><h4>{c.titles[reportTab]}</h4><p>{c.texts[reportTab]}</p></div>
      <p className="flow-note">{c.reportNote}</p>
    </> : <>
      <h3>{c.work}</h3>
      <div className="flow-work">{c.workItems.map((item, i) => <div key={item}><span className="flow-icon">{[<Users key="u" />, <FileText key="f" />, <Wallet key="w" />][i]}</span><div><strong>{item}</strong><span>{c.workDetails[i]}</span></div><ArrowRight size={16} /></div>)}</div>
      <p className="flow-note">{c.workNote}</p>
    </>}
  </div>;
}
