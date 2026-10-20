import { ArrowUpRight, FileSearch, GitBranch, Route } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAmbientMotion } from "./AmbientMotion";
import SectionAtmosphere from "./SectionAtmosphere";
import "./vision-sections.css";

const copy = {
  ru: {
    approachKicker: "ПОДХОД ALGO",
    approachTitle: "За каждым выводом —",
    approachAccent: "ответы ученика.",
    approachLink: "Посмотреть диагностику в действии",
    principles: [
      {
        title: "Подбор по ходу решения",
        text: "Следующее задание выбирается с учётом ответов. ALGO проверяет математику 5–11 классов через адаптивную последовательность заданий.",
      },
      {
        title: "Проверка базовых опор",
        text: "При необходимости Deep Scan обращается к связанным базовым навыкам. В отчёте остаются вопросы, ответы и результаты этой дополнительной проверки.",
      },
      {
        title: "Понятное основание следующего шага",
        text: "Журнал ошибок, анализ навыков и план обучения помогают разобрать результат. Преподаватель видит основания и выбирает, как продолжить работу с учеником.",
      },
    ],
    futureKicker: "НАПРАВЛЕНИЯ РАЗВИТИЯ",
    futureTitle: "Разные форматы обучения.",
    futureAccent: "Один фокус — ученик.",
    directions: [
      {
        status: "Сегодня",
        title: "Учебные центры",
        text: "Развиваем связанный процесс: диагностика, экзамены, занятия и расчёты команды.",
      },
      {
        status: "Следующий этап",
        title: "Частные школы",
        text: "Планируем адаптировать ALGO к учебному процессу школы и задачам её команды.",
      },
      {
        status: "Исследуем",
        title: "Частные преподаватели",
        text: "Изучаем, как сделать возможности ALGO удобными для самостоятельной работы преподавателя с учениками.",
      },
    ],
  },
  en: {
    approachKicker: "THE ALGO APPROACH",
    approachTitle: "Behind each insight:",
    approachAccent: "the student’s answers.",
    approachLink: "Explore diagnostics in action",
    principles: [
      {
        title: "Tasks selected as the student works",
        text: "The next task takes previous answers into account. ALGO assesses mathematics in grades 5–11 through an adaptive sequence of tasks.",
      },
      {
        title: "A closer look at the foundations",
        text: "When needed, Deep Scan checks related prerequisite skills. Its questions, answers and outcomes remain available in the report.",
      },
      {
        title: "A clear basis for the next step",
        text: "The error journal, skill analysis and learning plan help explain the result. The teacher can review the evidence and choose how to continue working with the student.",
      },
    ],
    futureKicker: "WHERE WE’RE HEADING",
    futureTitle: "Different ways to learn.",
    futureAccent: "One focus: the student.",
    directions: [
      {
        status: "Today",
        title: "Learning centers",
        text: "Developing a connected workflow across diagnostics, exams, lessons and team calculations.",
      },
      {
        status: "Next stage",
        title: "Private schools",
        text: "We plan to adapt ALGO to school learning processes and the needs of school teams.",
      },
      {
        status: "Exploring",
        title: "Independent teachers",
        text: "We’re exploring how ALGO can support teachers who work independently with their students.",
      },
    ],
  },
  uz: {
    approachKicker: "ALGO YONDASHUVI",
    approachTitle: "Har bir xulosa ortida —",
    approachAccent: "o‘quvchining javoblari.",
    approachLink: "Diagnostikani amalda ko‘rish",
    principles: [
      {
        title: "Yechish davomida tanlanadigan topshiriqlar",
        text: "Keyingi topshiriq javoblarni hisobga olgan holda tanlanadi. ALGO 5–11-sinflar matematikasini adaptiv topshiriqlar ketma-ketligi orqali tekshiradi.",
      },
      {
        title: "Tayanch ko‘nikmalarni tekshirish",
        text: "Zarur bo‘lganda Deep Scan bog‘liq tayanch ko‘nikmalarni tekshiradi. Hisobotda bu qo‘shimcha tekshiruvning savollari, javoblari va natijalari saqlanadi.",
      },
      {
        title: "Keyingi qadamning tushunarli asosi",
        text: "Xatolar jurnali, ko‘nikmalar tahlili va o‘quv rejasi natijani tushunishga yordam beradi. O‘qituvchi asoslarni ko‘rib, o‘quvchi bilan ishni qanday davom ettirishni tanlaydi.",
      },
    ],
    futureKicker: "RIVOJLANISH YO‘NALISHLARI",
    futureTitle: "Turli ta’lim shakllari.",
    futureAccent: "Bitta e’tibor — o‘quvchi.",
    directions: [
      {
        status: "Bugun",
        title: "O‘quv markazlari",
        text: "Diagnostika, imtihonlar, darslar va jamoa hisoblarini bog‘laydigan jarayonni rivojlantiryapmiz.",
      },
      {
        status: "Keyingi bosqich",
        title: "Xususiy maktablar",
        text: "ALGO’ni maktabning o‘quv jarayoni va jamoasi vazifalariga moslashtirishni rejalashtiryapmiz.",
      },
      {
        status: "O‘rganyapmiz",
        title: "Mustaqil o‘qituvchilar",
        text: "ALGO imkoniyatlarini o‘quvchilari bilan mustaqil ishlaydigan o‘qituvchilar uchun qanday qulay qilishni o‘rganyapmiz.",
      },
    ],
  },
};

const principleIcons = [Route, GitBranch, FileSearch];

export function ApproachSection() {
  const { locale } = useTranslation();
  const c = copy[locale];

  return <section className="vision-approach" id="approach" aria-labelledby="approach-title">
    <div className="shell vision-layout">
      <div className="vision-heading">
        <div className="section-kicker">{c.approachKicker}</div>
        <h2 id="approach-title">{c.approachTitle}<br /><em>{c.approachAccent}</em></h2>

        <a className="vision-link" href="#diagnostics">{c.approachLink}<ArrowUpRight aria-hidden="true" /></a>
      </div>
      <div className="vision-principles">
        {c.principles.map((principle, i) => {
          const Icon = principleIcons[i];
          return <div className="vision-principle" key={principle.title}>
            <Icon aria-hidden="true" />
            <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}

export function FutureSection() {
  const { locale } = useTranslation();
  const c = copy[locale];
  const { paused } = useAmbientMotion();

  return <section className="vision-future atmosphere-section" id="future" aria-labelledby="future-title">
    <SectionAtmosphere variant="path" paused={paused} />
    <div className="shell vision-layout">
      <div className="vision-heading">
        <div className="section-kicker">{c.futureKicker}</div>
        <h2 id="future-title">{c.futureTitle}<br /><em>{c.futureAccent}</em></h2>

      </div>
      <ol className="vision-directions">
        {c.directions.map((direction, i) => <li className={`vision-direction${i === 0 ? " vision-direction-current" : ""}`} key={direction.title}>
          <span className="vision-direction-status">{direction.status}</span>
          <h3>{direction.title}</h3>
          <p>{direction.text}</p>
        </li>)}
      </ol>
    </div>
  </section>;
}
