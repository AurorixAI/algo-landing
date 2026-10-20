import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronRight, Layers3, RefreshCw } from "lucide-react";
import { getPreparationQuestion, preparationQuestions, type ExamLocale, type ExamQuestion, type ExamScope, type PreparationSelection } from "./exam-preparation-data";
import "./exam-preparation.css";

const copy = {
  ru: {
    topics: "По темам", textbook: "По учебнику", source: "Источник заданий", program: "Выбор из программы", grade: "6 класс", branch: "Сложение и вычитание смешанных чисел",
    common: "Разные знаменатели", mixed: "Одинаковые знаменатели", commonDetail: "Приведение к общему знаменателю", mixedDetail: "Сложение смешанных чисел",
    books: "Учебник и параграф", math: "Математика · 6 класс", vilenkin: "Н. Я. Виленкин и др.", school: "Школьное издание", publisher: "Мнемозина", selectedSection: "Выбранный параграф",
    vilenkinSection: "§ 12. Сложение и вычитание смешанных чисел", schoolSection: "§§ 34–37. Сложение и вычитание смешанных дробей", page: "стр.",
    structure: "Состав работы", parameters: "5 заданий · 45 минут", easy: "Лёгкие", medium: "Средние", hard: "Сложные",
    question: "Задание 1 из 5", preview: "Проверка перед проведением", instruction: "Выполните действие:", level: "Уровень", showReview: "Ответ и возможные ошибки", hideReview: "Свернуть разбор",
    correct: "Правильный ответ", errors: "Дистракторы · возможные ошибки", possible: "Возможная логика ответа", missing: "В банке для этого варианта пока нет подробного объяснения. Причину ошибки нужно уточнить с учеником.",
    replace: "Выбрать замену", close: "Закрыть замену", alternative: "Другое задание по выбранному источнику", use: "Поставить в работу", replaced: "Задание заменено. Источник и уровень сложности сохранены.",
  },
  en: {
    topics: "By topic", textbook: "By textbook", source: "Question source", program: "Select from the curriculum", grade: "Grade 6", branch: "Adding and subtracting mixed numbers",
    common: "Different denominators", mixed: "Same denominators", commonDetail: "Finding a common denominator", mixedDetail: "Adding mixed numbers",
    books: "Textbook and section", math: "Mathematics · Grade 6", vilenkin: "N. Ya. Vilenkin et al.", school: "School edition", publisher: "Mnemozina", selectedSection: "Selected section",
    vilenkinSection: "§ 12. Adding and subtracting mixed numbers", schoolSection: "§§ 34–37. Adding and subtracting mixed fractions", page: "p.",
    structure: "Paper structure", parameters: "5 questions · 45 minutes", easy: "Easy", medium: "Medium", hard: "Hard",
    question: "Question 1 of 5", preview: "Review before delivery", instruction: "Calculate:", level: "Level", showReview: "Answer and possible errors", hideReview: "Collapse review",
    correct: "Correct answer", errors: "Distractors · possible errors", possible: "Possible reasoning", missing: "The bank does not yet contain a detailed explanation for this value. Clarify the reasoning with the student.",
    replace: "Choose a replacement", close: "Close replacements", alternative: "Another question from the selected source", use: "Use this question", replaced: "Question replaced. The source and difficulty level are preserved.",
  },
  uz: {
    topics: "Mavzu bo‘yicha", textbook: "Darslik bo‘yicha", source: "Topshiriqlar manbasi", program: "Dasturdan tanlash", grade: "6-sinf", branch: "Aralash sonlarni qo‘shish va ayirish",
    common: "Turli maxrajlar", mixed: "Bir xil maxrajlar", commonDetail: "Umumiy maxrajga keltirish", mixedDetail: "Aralash sonlarni qo‘shish",
    books: "Darslik va paragraf", math: "Matematika · 6-sinf", vilenkin: "N. Ya. Vilenkin va boshqalar", school: "Maktab nashri", publisher: "Mnemozina", selectedSection: "Tanlangan paragraf",
    vilenkinSection: "§ 12. Aralash sonlarni qo‘shish va ayirish", schoolSection: "§§ 34–37. Aralash kasrlarni qo‘shish va ayirish", page: "bet",
    structure: "Ish tarkibi", parameters: "5 topshiriq · 45 daqiqa", easy: "Oson", medium: "O‘rtacha", hard: "Qiyin",
    question: "5 topshiriqdan 1-si", preview: "O‘tkazishdan oldingi tekshiruv", instruction: "Amalni bajaring:", level: "Daraja", showReview: "Javob va ehtimoliy xatolar", hideReview: "Tahlilni yig‘ish",
    correct: "To‘g‘ri javob", errors: "Distraktorlar · ehtimoliy xatolar", possible: "Javobning ehtimoliy mantiqi", missing: "Bankda bu variant uchun batafsil izoh hali yo‘q. Xato sababini o‘quvchi bilan aniqlashtirish kerak.",
    replace: "O‘rniga boshqasini tanlash", close: "Almashtirishni yopish", alternative: "Tanlangan manbadan boshqa topshiriq", use: "Ishga qo‘shish", replaced: "Topshiriq almashtirildi. Manba va qiyinlik darajasi saqlandi.",
  },
};

function Operand({ value }: { value: ExamQuestion["left"] }) {
  return <span className="exam-mixed">{value.whole}<span className="exam-fraction"><span>{value.numerator}</span><span>{value.denominator}</span></span></span>;
}

export function ExamEquation({ question }: { question: ExamQuestion }) {
  const operandText = (value: ExamQuestion["left"]) => `${value.whole ? `${value.whole} ` : ""}${value.numerator}/${value.denominator}`;
  return <div className="exam-equation" role="math" aria-label={`${operandText(question.left)} + ${operandText(question.right)}`}><span aria-hidden="true"><Operand value={question.left} /></span><span aria-hidden="true">+</span><span aria-hidden="true"><Operand value={question.right} /></span></div>;
}

function QuestionReview({ locale, question, alternative, onReplace }: { locale: ExamLocale; question: ExamQuestion; alternative: ExamQuestion; onReplace: () => void }) {
  const c = copy[locale];
  const id = useId();
  const [review, setReview] = useState(true);
  const [replacing, setReplacing] = useState(false);
  const [error, setError] = useState(0);
  const replaceButton = useRef<HTMLButtonElement>(null);
  const replacementPending = useRef(false);
  useLayoutEffect(() => {
    setReview(true);
    setReplacing(false);
    setError(0);
    if (replacementPending.current) {
      replaceButton.current?.focus();
      replacementPending.current = false;
    }
  }, [question.id]);
  const selected = question.distractors[error] ?? question.distractors[0];
  return <div className="exam-prep-preview">
    <div className="exam-prep-question-head"><div><h5>{c.question}</h5><p>{c.preview}</p></div><span className="exam-prep-level">{c.level} {question.level}</span></div>
    <p className="exam-prep-prompt">{c.instruction}</p><ExamEquation question={question} />
    <div className="exam-prep-actions"><button type="button" className="exam-action" aria-expanded={review} aria-controls={`${id}-review`} onClick={() => setReview(value => !value)}>{review ? c.hideReview : c.showReview}</button><button ref={replaceButton} type="button" className="exam-action" aria-expanded={replacing} aria-controls={`${id}-replacement`} onClick={() => setReplacing(value => !value)}><RefreshCw size={14} aria-hidden="true" />{replacing ? c.close : c.replace}</button></div>
    {review && <div className="exam-prep-review" id={`${id}-review`}>
      <h6><Check size={17} aria-hidden="true" />{c.correct}<strong className="exam-prep-correct-value">{question.answer}</strong></h6>
      <p>{question.solution[locale]}</p>
      <p className="exam-prep-analysis-title">{c.errors}</p>
      <div className="exam-prep-error-tabs" role="group" aria-label={c.errors}>{question.distractors.map((item, index) => <button type="button" key={item.value} aria-pressed={error === index} aria-controls={`${id}-error`} onClick={() => setError(index)}>{item.value}</button>)}</div>
      <div className="exam-prep-error-detail" id={`${id}-error`} aria-live="polite"><strong>{selected.value} · {c.possible}</strong><p>{selected.explanation?.[locale] ?? c.missing}</p></div>
    </div>}
    {replacing && <div className="exam-prep-alternative" id={`${id}-replacement`}><h6>{c.alternative}</h6><p>{c.grade} · {c.level} {alternative.level}</p><ExamEquation question={alternative} /><button type="button" className="exam-action exam-action-primary" onClick={() => { replacementPending.current = true; onReplace(); }}>{c.use}<ArrowRight size={14} aria-hidden="true" /></button></div>}
  </div>;
}

export default function ExamPreparation({ locale, selection, onChange }: { locale: ExamLocale; selection: PreparationSelection; onChange: (selection: PreparationSelection) => void }) {
  const c = copy[locale];
  const question = getPreparationQuestion(selection);
  const scope = selection.source === "topics" ? selection.topic : selection.book;
  const variantKey = selection.source === "topics" ? "topicVariant" : "bookVariant";
  const variant = selection[variantKey];
  const alternative = preparationQuestions[scope][variant === 0 ? 1 : 0];
  const [replaced, setReplaced] = useState(false);
  function choose(next: PreparationSelection) { setReplaced(false); onChange(next); }
  return <div className="exam-prep">
    <div className="exam-prep-settings">
      <div className="exam-prep-source-tabs" role="group" aria-label={c.source}><button type="button" aria-pressed={selection.source === "topics"} onClick={() => choose({ ...selection, source: "topics" })}><Layers3 size={17} aria-hidden="true" />{c.topics}</button><button type="button" aria-pressed={selection.source === "textbook"} onClick={() => choose({ ...selection, source: "textbook" })}><BookOpen size={17} aria-hidden="true" />{c.textbook}</button></div>
      {selection.source === "topics" ? <div className="exam-prep-source">
        <h5>{c.program}</h5><p className="exam-prep-path">{c.grade}<ChevronRight aria-hidden="true" />{c.branch}</p>
        <div className="exam-prep-options" role="group" aria-label={c.program}>{(["common", "mixed"] as ExamScope[]).map(value => <button className="exam-prep-choice" type="button" key={value} aria-pressed={selection.topic === value} onClick={() => choose({ ...selection, topic: value, topicVariant: 0 })}><span className="exam-prep-choice-dot" aria-hidden="true" /><span><strong>{c[value]}</strong><span>{value === "common" ? c.commonDetail : c.mixedDetail}</span></span></button>)}</div>
      </div> : <div className="exam-prep-source">
        <h5>{c.books}</h5><div className="exam-prep-options exam-prep-books" role="group" aria-label={c.books}>{(["mixed", "common"] as ExamScope[]).map(value => <button className="exam-prep-choice" type="button" key={value} aria-pressed={selection.book === value} onClick={() => choose({ ...selection, book: value, bookVariant: 0 })}><span className="exam-prep-choice-dot" aria-hidden="true" /><span><strong>{value === "common" ? c.vilenkin : c.school}</strong><span>{c.math}</span><span>{value === "common" ? c.publisher : "O‘qituvchi · 2017"}</span></span></button>)}</div>
        <div className="exam-prep-toc"><span>{c.selectedSection}</span><strong><Check size={15} aria-hidden="true" />{selection.book === "common" ? c.vilenkinSection : c.schoolSection}</strong><span>{c.page} {selection.book === "common" ? 74 : 51}</span></div>
      </div>}
      <div className="exam-prep-parameters"><div className="exam-prep-parameter-head"><h5>{c.structure}</h5><span>{c.parameters}</span></div><dl className="exam-prep-difficulty">{[["A", c.easy, 3], ["B", c.medium, 2], ["C", c.hard, 0]].map(([level, label, count]) => <div key={level}><dt><span>{level}</span>{label}</dt><dd>{count}</dd></div>)}</dl></div>
      <div aria-live="polite">{replaced && <p className="exam-prep-status"><Check size={15} aria-hidden="true" />{c.replaced}</p>}</div>
    </div>
    <QuestionReview key={`${selection.source}-${scope}`} locale={locale} question={question} alternative={alternative} onReplace={() => { onChange({ ...selection, [variantKey]: variant === 0 ? 1 : 0 }); setReplaced(true); }} />
  </div>;
}
