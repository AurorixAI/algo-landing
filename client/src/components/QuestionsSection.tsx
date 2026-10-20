import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { BookOpen, Users, Wallet } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAmbientMotion } from "./AmbientMotion";
import SectionAtmosphere from "./SectionAtmosphere";
import "./questions-section.css";

const copy = {
  ru: {
    kicker: "09 / ПЕРЕД ПОДКЛЮЧЕНИЕМ", title: "Вопросы", accent: "и ответы.", topics: ["Обучение", "Доступ и роли", "Оплаты и подключение"],
    items: [
      { id: "scope", q: "Для кого ALGO и какие предметы поддерживает?", paragraphs: ["ALGO объединяет работу учебного центра: учеников и группы, расписание, посещаемость, экзамены, учёт оплат и расчёт преподавателей.", "Диагностика и банк заданий сейчас охватывают математику 5–11 классов."] },
      { id: "diagnostic", q: "Чем диагностика отличается от экзамена?", paragraphs: ["Диагностика подбирает задания с учётом ответов ученика и помогает определить учебную отправную точку. При необходимости Deep Scan проверяет связанные базовые навыки.", "Экзамен — подготовленная преподавателем работа для группы. В нём собираются ответы и результаты по выбранным заданиям."] },
      { id: "paper", q: "Можно ли провести экзамен на бумаге?", paragraphs: ["Да. Для печати готовятся бланк ученика и отдельный ключ преподавателя.", "Бумажную работу проверяет преподаватель. В онлайн-экзамене ответы ученика собираются в ALGO."] },
      { id: "access", q: "Как ученики и родители получают доступ?", paragraphs: ["На диагностику и онлайн-экзамен ученик входит по ссылке в браузере.", "Для ученика и родителя есть отдельные Telegram-кабинеты с результатами и посещаемостью. Доступ подключает учебный центр."] },
      { id: "roles", q: "Кто видит учебные данные и финансы?", paragraphs: ["Преподаватель работает со своими учениками, группами и учебными результатами. Администратор организует работу центра; доступ к оплатам выдаётся отдельно.", "Финансовые записи и расчёт зарплаты доступны владельцу. Возможности сотрудника зависят от его роли и выданных прав."] },
      { id: "payments", q: "Можно ли оплачивать обучение через ALGO?", paragraphs: ["Сейчас ALGO ведёт учёт внесённых оплат по периодам и пакетам занятий и формирует квитанции.", "Онлайн-оплата обучения через Telegram готовится к запуску и пока недоступна."] },
      { id: "setup", q: "С чего начать подключение центра?", paragraphs: ["Оставьте заявку и укажите, что хотите посмотреть: учебную часть, управление центром, финансы или Telegram.", "На демо покажем нужные сценарии и права сотрудников, обсудим подключение и условия для вашего центра."] },
    ],
  },
  en: {
    kicker: "09 / BEFORE YOU START", title: "Questions", accent: "and answers.", topics: ["Learning", "Access and roles", "Payments and setup"],
    items: [
      { id: "scope", q: "Who is ALGO for, and which subjects does it cover?", paragraphs: ["ALGO connects a learning centre’s students and groups, schedules, attendance, exams, payment records and teacher payroll calculations.", "Diagnostics and the question bank currently cover mathematics in grades 5–11."] },
      { id: "diagnostic", q: "How does a diagnostic assessment differ from an exam?", paragraphs: ["A diagnostic assessment selects questions based on the student’s answers to help identify a learning starting point. When needed, Deep Scan checks related foundational skills.", "An exam uses a teacher-prepared set of questions for a group and collects each student’s answers and results."] },
      { id: "paper", q: "Can we run an exam on paper?", paragraphs: ["Yes. You can prepare a student worksheet and a separate teacher answer key for printing.", "The teacher marks the paper exam. In an online exam, student answers are collected in ALGO."] },
      { id: "access", q: "How do students and parents get access?", paragraphs: ["Students open diagnostic assessments and online exams from a link in their browser.", "Students and parents each have their own Telegram dashboard for results and attendance. Their learning centre provides access."] },
      { id: "roles", q: "Who can see learning records and finances?", paragraphs: ["Teachers work with their own students, groups and learning results. Administrators organize the centre’s work; payment access is granted separately.", "Owners can view financial records and payroll calculations. Each staff member’s access follows their role and assigned permissions."] },
      { id: "payments", q: "Can families pay tuition through ALGO?", paragraphs: ["ALGO currently records payments for calendar periods and lesson packages and generates receipts.", "Online tuition payments through Telegram are being prepared and are not available yet."] },
      { id: "setup", q: "How can our centre get started?", paragraphs: ["Send a request and tell us what you want to explore: learning tools, centre operations, finances or Telegram.", "During the demo, we’ll show the relevant workflows and staff permissions, then discuss setup and terms for your centre."] },
    ],
  },
  uz: {
    kicker: "09 / ULANISHDAN OLDIN", title: "Savollar", accent: "va javoblar.", topics: ["Ta’lim", "Kirish va rollar", "To‘lovlar va ulanish"],
    items: [
      { id: "scope", q: "ALGO kimlar uchun va qaysi fanlarni qamrab oladi?", paragraphs: ["ALGO o‘quv markazidagi o‘quvchilar va guruhlar, dars jadvali, davomat, imtihonlar, to‘lovlar hisobi va o‘qituvchilar ish haqi hisobini birlashtiradi.", "Diagnostika va topshiriqlar banki hozir 5–11-sinflar matematikasini qamrab oladi."] },
      { id: "diagnostic", q: "Diagnostikaning imtihondan farqi nimada?", paragraphs: ["Diagnostika o‘quvchining javoblariga qarab topshiriqlarni tanlaydi va o‘qishni nimadan boshlashni aniqlashga yordam beradi. Zarur bo‘lsa, Deep Scan bog‘liq tayanch ko‘nikmalarni tekshiradi.", "Imtihon — o‘qituvchi guruh uchun tayyorlagan ish. Unda tanlangan topshiriqlar bo‘yicha javoblar va natijalar yig‘iladi."] },
      { id: "paper", q: "Imtihonni qog‘ozda o‘tkazish mumkinmi?", paragraphs: ["Ha. Chop etish uchun o‘quvchi blankasi va o‘qituvchiga alohida javoblar kaliti tayyorlanadi.", "Qog‘ozdagi ishni o‘qituvchi tekshiradi. Onlayn imtihonda esa o‘quvchining javoblari ALGO’da yig‘iladi."] },
      { id: "access", q: "O‘quvchi va ota-onaga kirish qanday beriladi?", paragraphs: ["O‘quvchi diagnostika va onlayn imtihonga havola orqali brauzerda kiradi.", "O‘quvchi va ota-onalar uchun natijalar hamda davomat ko‘rsatiladigan alohida Telegram kabinetlari bor. Kirishni o‘quv markazi ulaydi."] },
      { id: "roles", q: "O‘quv ma’lumotlari va moliyani kim ko‘radi?", paragraphs: ["O‘qituvchi o‘z o‘quvchilari, guruhlari va o‘quv natijalari bilan ishlaydi. Administrator markaz ishlarini tashkil etadi; to‘lovlarga kirish alohida beriladi.", "Moliyaviy yozuvlar va ish haqi hisobi markaz egasiga ochiq. Xodimning imkoniyatlari uning roli va berilgan huquqlarga bog‘liq."] },
      { id: "payments", q: "ALGO orqali o‘qish uchun to‘lash mumkinmi?", paragraphs: ["Hozir ALGO’da davrlar va dars paketlari uchun kiritilgan to‘lovlar hisobga olinadi hamda kvitansiyalar shakllantiriladi.", "Telegram orqali o‘qish uchun onlayn to‘lov tayyorlanmoqda va hozircha mavjud emas."] },
      { id: "setup", q: "Markazni ulashni nimadan boshlaymiz?", paragraphs: ["So‘rov qoldiring va nimani ko‘rishni istashingizni yozing: o‘quv qismi, markaz boshqaruvi, moliya yoki Telegram.", "Demoda kerakli jarayonlar va xodimlar huquqlarini ko‘rsatamiz, markazingizni ulash va foydalanish shartlarini muhokama qilamiz."] },
    ],
  },
};

const topics = [
  { id: "learning", icon: BookOpen, items: ["scope", "diagnostic", "paper"] },
  { id: "access", icon: Users, items: ["access", "roles"] },
  { id: "setup", icon: Wallet, items: ["payments", "setup"] },
];

export default function QuestionsSection() {
  const { locale } = useTranslation();
  const { paused } = useAmbientMotion();
  const [activeTopic, setActiveTopic] = useState("learning");
  const c = copy[locale];
  return <section id="questions" className="questions-section atmosphere-section" aria-labelledby="questions-title">
    <SectionAtmosphere variant="paper" paused={paused} />
    <div className="shell questions-layout">
      <div className="questions-heading"><div className="section-kicker mono">{c.kicker}</div><h2 id="questions-title">{c.title} <em>{c.accent}</em></h2></div>
      <Tabs.Root className="questions-board" value={activeTopic} onValueChange={setActiveTopic}>
        <Tabs.List className="questions-topics" aria-label={`${c.title} ${c.accent}`}>
          {topics.map((topic, index) => <Tabs.Trigger className="questions-topic" key={topic.id} value={topic.id}><topic.icon aria-hidden="true" /><span>{c.topics[index]}</span></Tabs.Trigger>)}
        </Tabs.List>
        {/* Shared grid sizing reserves the tallest topic at every width and locale. */}
        <div className="questions-panels">
          {topics.map(topic => <Tabs.Content className="questions-panel" key={topic.id} value={topic.id} forceMount
            aria-hidden={activeTopic !== topic.id} inert={activeTopic !== topic.id} tabIndex={activeTopic === topic.id ? 0 : -1}>
            <div className="questions-grid" data-columns={topic.items.length}>
              {topic.items.map(id => {
                const item = c.items.find(item => item.id === id)!;
                return <article className="questions-card" key={id}>
                  <h3>{item.q}</h3>
                  <div className="questions-answer">{item.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
                </article>;
              })}
            </div>
          </Tabs.Content>)}
        </div>
      </Tabs.Root>
    </div>
  </section>;
}
