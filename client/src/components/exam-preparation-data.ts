export type ExamLocale = "ru" | "en" | "uz";
type Localized = Record<ExamLocale, string>;
export type ExamScope = "common" | "mixed";
type Operand = { whole?: number; numerator: number; denominator: number };
export type ExamQuestion = {
  id: string;
  scope: ExamScope;
  level: "A" | "B";
  left: Operand;
  right: Operand;
  answer: string;
  solution: Localized;
  distractors: { value: string; explanation: Localized | null }[];
};

// Saved content records, not student answers. See DESIGN.md for source bindings.
// The displayed explanations are checked arithmetic hypotheses, not diagnoses.
export const preparationQuestions: Record<ExamScope, readonly ExamQuestion[]> = {
  common: [
    {
      id: "G6_TB_12_513.1", scope: "common", level: "B",
      left: { numerator: 1, denominator: 3 }, right: { numerator: 1, denominator: 5 }, answer: "8/15",
      solution: {
        ru: "Общий знаменатель — 15. Получаем 5/15 + 3/15 = 8/15.",
        en: "The common denominator is 15: 5/15 + 3/15 = 8/15.",
        uz: "Umumiy maxraj — 15. Natija: 5/15 + 3/15 = 8/15.",
      },
      distractors: [
        { value: "2/8", explanation: { ru: "Такой ответ может получиться, если сложить отдельно числители и знаменатели: (1 + 1)/(3 + 5). При сложении дробей это правило не работает.", en: "This can result from adding numerators and denominators separately: (1 + 1)/(3 + 5). That rule does not apply to fraction addition.", uz: "Surat va maxrajlarni alohida qo‘shganda shunday javob chiqishi mumkin: (1 + 1)/(3 + 5). Kasrlarni qo‘shishda bu qoida ishlamaydi." } },
        { value: "2/15", explanation: { ru: "Знаменатель 15 выбран, но числители не приведены к нему. Вместо 5 + 3 сложены исходные 1 + 1.", en: "The denominator is 15, but the numerators were not converted: the original 1 + 1 was used instead of 5 + 3.", uz: "Maxraj 15 deb olingan, ammo suratlar unga moslashtirilmagan. 5 + 3 o‘rniga dastlabki 1 + 1 qo‘shilgan." } },
        { value: "1/15", explanation: { ru: "Такой результат соответствует умножению 1/3 · 1/5. Возможная ошибка — выполнить умножение вместо сложения.", en: "This is the product 1/3 × 1/5. One possible error is multiplying instead of adding.", uz: "Bu 1/3 × 1/5 ko‘paytmasiga teng. Ehtimoliy xato — qo‘shish o‘rniga ko‘paytirish." } },
      ],
    },
    {
      id: "G6_TB_12_513.3", scope: "common", level: "B",
      left: { whole: 2, numerator: 1, denominator: 9 }, right: { whole: 1, numerator: 1, denominator: 3 }, answer: "3 4/9",
      solution: { ru: "Приводим 1/3 к 3/9. Целые части: 2 + 1 = 3; дробные: 1/9 + 3/9 = 4/9. Ответ: 3 4/9.", en: "Convert 1/3 to 3/9. Whole parts: 2 + 1 = 3; fractions: 1/9 + 3/9 = 4/9. Answer: 3 4/9.", uz: "1/3 ni 3/9 ga keltiramiz. Butun qismlar: 2 + 1 = 3; kasrlar: 1/9 + 3/9 = 4/9. Javob: 3 4/9." },
      distractors: [
        { value: "3 2/9", explanation: { ru: "Возможная ошибка — заменить 1/3 на 1/9, не умножив числитель на 3. Тогда дробная часть ошибочно получается 1/9 + 1/9 = 2/9.", en: "A possible error is converting 1/3 to 1/9 without multiplying the numerator by 3, giving 1/9 + 1/9 = 2/9.", uz: "Ehtimoliy xato — suratni 3 ga ko‘paytirmay, 1/3 ni 1/9 ga almashtirish. Shunda kasr qismi xato ravishda 1/9 + 1/9 = 2/9 bo‘ladi." } },
        { value: "4 4/9", explanation: { ru: "Дробная часть совпадает с верной, а целая — на 1 больше. Этот вариант может получиться при ошибочном сложении 2 + 1 = 4.", en: "The fractional part is correct, but the whole part is one too large. This can result from incorrectly calculating 2 + 1 as 4.", uz: "Kasr qismi to‘g‘ri, butun qismi esa 1 ga ortiq. Bu 2 + 1 ni xato ravishda 4 deb hisoblashdan kelib chiqishi mumkin." } },
      ],
    },
  ],
  mixed: [
    {
      id: "G6_TB_34–37_320.4", scope: "mixed", level: "A",
      left: { whole: 2, numerator: 1, denominator: 2 }, right: { whole: 3, numerator: 1, denominator: 2 }, answer: "6",
      solution: { ru: "Целые части дают 2 + 3 = 5. Дробные части: 1/2 + 1/2 = 1. Итого: 5 + 1 = 6.", en: "The whole parts give 2 + 3 = 5. The fractions give 1/2 + 1/2 = 1. Total: 5 + 1 = 6.", uz: "Butun qismlar: 2 + 3 = 5. Kasr qismlari: 1/2 + 1/2 = 1. Jami: 5 + 1 = 6." },
      distractors: [
        { value: "5", explanation: { ru: "Такой ответ может получиться, если сложить только 2 + 3 и пропустить обе дробные части. Их сумма добавляет ещё одну целую.", en: "This can result from adding only 2 + 3 and omitting both fractions. The fractional parts add another whole.", uz: "Faqat 2 + 3 qo‘shilib, ikkala kasr qismi tashlab ketilsa, shunday javob chiqishi mumkin. Kasr qismlari yana bitta butunni beradi." } },
        { value: "5 1/4", explanation: { ru: "Возможная ошибка — умножить дробные части: 1/2 · 1/2 = 1/4. В этом задании их нужно сложить.", en: "A possible error is multiplying the fractions: 1/2 × 1/2 = 1/4. This question requires addition.", uz: "Ehtimoliy xato — kasr qismlarini ko‘paytirish: 1/2 × 1/2 = 1/4. Bu topshiriqda ularni qo‘shish kerak." } },
        // The bank has this value but only a generic explanation. Do not invent a cause.
        { value: "60", explanation: null },
      ],
    },
    {
      id: "G6_TB_34–37_320.3", scope: "mixed", level: "A",
      left: { whole: 3, numerator: 3, denominator: 5 }, right: { whole: 2, numerator: 1, denominator: 5 }, answer: "5 4/5",
      solution: { ru: "Целые части: 3 + 2 = 5. Дробные: 3/5 + 1/5 = 4/5. Ответ: 5 4/5.", en: "Whole parts: 3 + 2 = 5. Fractions: 3/5 + 1/5 = 4/5. Answer: 5 4/5.", uz: "Butun qismlar: 3 + 2 = 5. Kasrlar: 3/5 + 1/5 = 4/5. Javob: 5 4/5." },
      distractors: [
        { value: "5 4/10", explanation: { ru: "Здесь могли сложить не только числители 3 + 1, но и знаменатели 5 + 5. При одинаковых знаменателях знаменатель остаётся равным 5.", en: "Both numerators, 3 + 1, and denominators, 5 + 5, may have been added. When denominators are equal, the denominator stays 5.", uz: "Suratlar 3 + 1 bilan birga maxrajlar 5 + 5 ham qo‘shilgan bo‘lishi mumkin. Maxrajlar teng bo‘lsa, maxraj 5 bo‘lib qoladi." } },
        { value: "6 4/5", explanation: { ru: "Дробная часть верная. Целая часть 6 может получиться, если вместо 3 + 2 выполнить 3 · 2.", en: "The fractional part is correct. The whole part 6 can result from calculating 3 × 2 instead of 3 + 2.", uz: "Kasr qismi to‘g‘ri. 3 + 2 o‘rniga 3 × 2 bajarilsa, butun qism 6 chiqishi mumkin." } },
      ],
    },
  ],
};

export type PreparationSelection = { source: "topics" | "textbook"; topic: ExamScope; book: ExamScope; topicVariant: number; bookVariant: number };
export const initialPreparation: PreparationSelection = { source: "topics", topic: "common", book: "mixed", topicVariant: 0, bookVariant: 0 };
export function getPreparationQuestion(selection: PreparationSelection): ExamQuestion {
  const scope = selection.source === "topics" ? selection.topic : selection.book;
  const variant = selection.source === "topics" ? selection.topicVariant : selection.bookVariant;
  return preparationQuestions[scope][variant] ?? preparationQuestions[scope][0];
}
