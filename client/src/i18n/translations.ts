export type Locale = "ru" | "en" | "uz";

export interface Translations {
  nav: {
    platform: string;
    architecture: string;
    apiIntegrations: string;
    ecosystem: string;
    investors: string;
    login: string;
    demoForSchools: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    connectCenter: string;
    howItWorks: string;
    liveDiagnosis: string;
    studentName: string;
    studentInfo: string;
    scoreLabel: string;
    coreAccuracy: string;
    coreAccuracyValue: string;
    knowledgeGraph: string;
    knowledgeGraphValue: string;
    aiInsightLabel: string;
    aiInsightPrefix: string;
    aiInsightHighlight: string;
    aiInsightSuffix: string;
  };
  journey: {
    title: string;
    subtitle: string;
    steps: { title: string; subtitle: string; desc: string }[];
  };
  ecosystem: {
    titleLine1: string;
    titleLine2: string;
    parts: { name: string; role: string; desc: string }[];
    studentsCount: string;
    studentsLabel: string;
    secureAi: string;
    accuracyValue: string;
    accuracyLabel: string;
    globalValue: string;
    globalLabel: string;
    growthValue: string;
    growthLabel: string;
  };
  vision: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    cards: { title: string; text: string }[];
  };
  investors: {
    titleLine1: string;
    titleLine2: string;
    description: string;
    businessModelLabel: string;
    businessModelValue: string;
    ipStatusLabel: string;
    ipStatusValue: string;
    requestPitchDeck: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    stat4Value: string;
    stat4Label: string;
  };
  footer: {
    description: string;
    productsHeading: string;
    companyHeading: string;
    legalHeading: string;
    adminPortal: string;
    teacherDashboard: string;
    studentApp: string;
    apiDocs: string;
    technology: string;
    investorsLink: string;
    contacts: string;
    linkedin: string;
    copyright: string;
    privacy: string;
    terms: string;
  };
  contact: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    typeLabel: string;
    typeDemo: string;
    typePitchDeck: string;
    typeConnect: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    errorMessage: string;
    close: string;
  };
}

export const ru: Translations = {
  nav: {
    platform: "Платформа",
    architecture: "Архитектура",
    apiIntegrations: "API & Интеграции",
    ecosystem: "Экосистема",
    investors: "Инвесторам",
    login: "Войти",
    demoForSchools: "Демо для школ",
  },
  hero: {
    badge: "Операционная система нового поколения",
    titleLine1: "Математика",
    titleLine2: "без ошибок.",
    description:
      "ALGO — это интеллектуальный слой между учителем и результатом. Мы забираем 100% рутины, оставляя время на живое преподавание и глубокое развитие талантов.",
    connectCenter: "Подключить центр",
    howItWorks: "Как это работает",
    liveDiagnosis: "Живая диагностика",
    studentName: "Арслан С.",
    studentInfo: "8 Класс • Диагностика",
    scoreLabel: "Балл",
    coreAccuracy: "Точность ядра",
    coreAccuracyValue: "99.8%",
    knowledgeGraph: "Граф знаний",
    knowledgeGraphValue: "2.4k Узлов",
    aiInsightLabel: "AI Анализ",
    aiInsightPrefix: "Выявлен системный пробел в ",
    aiInsightHighlight: "Линейных Функциях",
    aiInsightSuffix: " из 7 класса. Генерация лечебного пакета завершена.",
  },
  journey: {
    title: "Бесшовный процесс",
    subtitle: "От первой встречи до гарантированного поступления.",
    steps: [
      {
        title: "Deep Scan",
        subtitle: "Входная диагностика",
        desc: "Система за 15 минут определяет реальный уровень ученика, находя пробелы даже 3-летней давности.",
      },
      {
        title: "Smart Exam",
        subtitle: "Генерация & Сдача",
        desc: "Учитель выбирает тему, а ИИ создает 50 уникальных вариантов с защитой от списывания.",
      },
      {
        title: "Full Audit",
        subtitle: "Аналитика & Отчёты",
        desc: "Мгновенные отчёты для родителей и тепловые карты успеваемости для администрации центра.",
      },
    ],
  },
  ecosystem: {
    titleLine1: "Единая экосистема",
    titleLine2: "для всего центра",
    parts: [
      { name: "Admin Portal", role: "Для владельцев", desc: "Полный контроль финансов, посещаемости и качества обучения в реальном времени." },
      { name: "Teacher Studio", role: "Для преподавателей", desc: "Автоматическая проверка работ и конструктор уроков на базе графа навыков." },
      { name: "Student App", role: "Для учеников", desc: "Персональный тренажёр и доступ к материалам 24/7." },
      { name: "Parent View", role: "Для родителей", desc: "Прозрачный прогресс и уведомления о каждом успехе ребёнка." },
    ],
    studentsCount: "~500",
    studentsLabel: "Учеников в системе",
    secureAi: "Secure AI",
    accuracyValue: "100%",
    accuracyLabel: "Точность вычислений",
    globalValue: "Global",
    globalLabel: "Scale Ready",
    growthValue: "4.8x",
    growthLabel: "Рост успеваемости",
  },
  vision: {
    badge: "Vision 2027",
    titleLine1: "Будущее образования —",
    titleLine2: "в вашем кармане",
    description:
      "Мы строим не просто сервис, а персонального AI-наставника, который знает о знаниях ребёнка больше, чем кто-либо другой.",
    cards: [
      { title: "AI Наставник 24/7", text: "Мгновенные ответы и объяснение любой задачи голосом или видео." },
      { title: "LIFT Метод", text: "Кратчайший путь к закрытию пробелов без лишней воды и зубрёжки." },
      { title: "SAT & Олимпиады", text: "Специализированная подготовка к международным тестам высшего уровня." },
    ],
  },
  investors: {
    titleLine1: "Инвестируйте в",
    titleLine2: "интеллект",
    description:
      "Мы создаём уникальный Proprietary IP — математическое ядро, которое станет стандартом качества в мировом EdTech.",
    businessModelLabel: "Бизнес-модель",
    businessModelValue: "B2B SaaS + APIaaS",
    ipStatusLabel: "IP Статус",
    ipStatusValue: "Уникальный граф из 2400+ математических навыков",
    requestPitchDeck: "Запросить Pitch Deck",
    stat1Value: "3",
    stat1Label: "Действующих пилотных проекта",
    stat2Value: "99%",
    stat2Label: "Retention Rate B2B",
    stat3Value: "2.4k",
    stat3Label: "Узлов в графе знаний",
    stat4Value: "Zero",
    stat4Label: "AI Галлюцинаций",
  },
  footer: {
    description: "Операционная система для школ будущего. Мы создаём технологии, которые помогают учить лучше и быстрее.",
    productsHeading: "Продукты",
    companyHeading: "Компания",
    legalHeading: "Правовая информация",
    adminPortal: "Admin Portal",
    teacherDashboard: "Teacher Dashboard",
    studentApp: "Student Mobile App",
    apiDocs: "API for Developers",
    technology: "Технология",
    investorsLink: "Инвесторам",
    contacts: "Контакты",
    linkedin: "LinkedIn",
    copyright: "© 2026 ALGO EdTech. Built with Intelligence.",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
  },
  contact: {
    title: "Свяжитесь с нами",
    subtitle: "Заполните форму, и мы свяжемся с вами в ближайшее время.",
    nameLabel: "Имя",
    namePlaceholder: "Ваше имя",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    typeLabel: "Тип запроса",
    typeDemo: "Демо для школ",
    typePitchDeck: "Запрос Pitch Deck",
    typeConnect: "Подключить центр",
    messageLabel: "Сообщение",
    messagePlaceholder: "Расскажите о вашем учебном центре…",
    submit: "Отправить",
    submitting: "Отправка…",
    successTitle: "Заявка отправлена!",
    successMessage: "Мы свяжемся с вами в ближайшее время.",
    errorMessage: "Ошибка отправки. Попробуйте ещё раз.",
    close: "Закрыть",
  },
};

export const en: Translations = {
  nav: {
    platform: "Platform",
    architecture: "Architecture",
    apiIntegrations: "API & Integrations",
    ecosystem: "Ecosystem",
    investors: "Investors",
    login: "Log in",
    demoForSchools: "Demo for Schools",
  },
  hero: {
    badge: "Next-Generation Operating System",
    titleLine1: "Mathematics",
    titleLine2: "without errors.",
    description:
      "ALGO is the intelligent layer between the teacher and results. We handle 100% of the routine, leaving time for live teaching and deeper talent development.",
    connectCenter: "Connect your center",
    howItWorks: "How it works",
    liveDiagnosis: "Live Diagnosis",
    studentName: "Arslan S.",
    studentInfo: "Grade 8 • Diagnostics",
    scoreLabel: "Score",
    coreAccuracy: "Core Accuracy",
    coreAccuracyValue: "99.8%",
    knowledgeGraph: "Knowledge Graph",
    knowledgeGraphValue: "2.4k Nodes",
    aiInsightLabel: "AI Insight",
    aiInsightPrefix: "A systemic gap detected in ",
    aiInsightHighlight: "Linear Functions",
    aiInsightSuffix: " from Grade 7. Remedial package generation complete.",
  },
  journey: {
    title: "Seamless Process",
    subtitle: "From the first meeting to guaranteed results.",
    steps: [
      {
        title: "Deep Scan",
        subtitle: "Entry Diagnostics",
        desc: "The system identifies the student's real level in 15 minutes, finding gaps from up to 3 years ago.",
      },
      {
        title: "Smart Exam",
        subtitle: "Generation & Testing",
        desc: "The teacher picks a topic and AI creates 50 unique variants with cheating protection.",
      },
      {
        title: "Full Audit",
        subtitle: "Analytics & Reports",
        desc: "Instant reports for parents and performance heat maps for center administration.",
      },
    ],
  },
  ecosystem: {
    titleLine1: "Unified ecosystem",
    titleLine2: "for the entire center",
    parts: [
      { name: "Admin Portal", role: "For owners", desc: "Full control of finances, attendance and learning quality in real time." },
      { name: "Teacher Studio", role: "For teachers", desc: "Automatic grading and lesson builder based on the skills graph." },
      { name: "Student App", role: "For students", desc: "Personal trainer and 24/7 access to materials." },
      { name: "Parent View", role: "For parents", desc: "Transparent progress and notifications on every child's achievement." },
    ],
    studentsCount: "~500",
    studentsLabel: "Students in system",
    secureAi: "Secure AI",
    accuracyValue: "100%",
    accuracyLabel: "Calculation accuracy",
    globalValue: "Global",
    globalLabel: "Scale Ready",
    growthValue: "4.8x",
    growthLabel: "Performance growth",
  },
  vision: {
    badge: "Vision 2027",
    titleLine1: "The future of education —",
    titleLine2: "in your pocket",
    description:
      "We're building more than a service — a personal AI tutor that knows more about a child's knowledge than anyone else.",
    cards: [
      { title: "AI Tutor 24/7", text: "Instant answers and explanations for any problem via voice or video." },
      { title: "LIFT Method", text: "The shortest path to closing knowledge gaps without unnecessary fluff." },
      { title: "SAT & Olympiads", text: "Specialized preparation for top-tier international tests." },
    ],
  },
  investors: {
    titleLine1: "Invest in",
    titleLine2: "intelligence",
    description:
      "We are creating unique Proprietary IP — a mathematical core that will become the quality standard in global EdTech.",
    businessModelLabel: "Business model",
    businessModelValue: "B2B SaaS + APIaaS",
    ipStatusLabel: "IP Status",
    ipStatusValue: "Unique graph of 2,400+ mathematical skills",
    requestPitchDeck: "Request Pitch Deck",
    stat1Value: "3",
    stat1Label: "Active pilot projects",
    stat2Value: "99%",
    stat2Label: "B2B Retention Rate",
    stat3Value: "2.4k",
    stat3Label: "Nodes in Knowledge Graph",
    stat4Value: "Zero",
    stat4Label: "AI Hallucinations",
  },
  footer: {
    description: "Operating system for the schools of the future. We build technology that helps teach better and faster.",
    productsHeading: "Products",
    companyHeading: "Company",
    legalHeading: "Legal",
    adminPortal: "Admin Portal",
    teacherDashboard: "Teacher Dashboard",
    studentApp: "Student Mobile App",
    apiDocs: "API for Developers",
    technology: "Technology",
    investorsLink: "Investors",
    contacts: "Contacts",
    linkedin: "LinkedIn",
    copyright: "© 2026 ALGO EdTech. Built with Intelligence.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  contact: {
    title: "Get in touch",
    subtitle: "Fill in the form and we'll get back to you shortly.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    typeLabel: "Request type",
    typeDemo: "Demo for Schools",
    typePitchDeck: "Request Pitch Deck",
    typeConnect: "Connect a center",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about your learning center…",
    submit: "Submit",
    submitting: "Submitting…",
    successTitle: "Request sent!",
    successMessage: "We'll get back to you shortly.",
    errorMessage: "Failed to send. Please try again.",
    close: "Close",
  },
};

export const uz: Translations = {
  nav: {
    platform: "Platforma",
    architecture: "Arxitektura",
    apiIntegrations: "API & Integratsiya",
    ecosystem: "Ekotizim",
    investors: "Investorlar",
    login: "Kirish",
    demoForSchools: "Maktablar uchun demo",
  },
  hero: {
    badge: "Yangi avlod operatsion tizimi",
    titleLine1: "Matematika",
    titleLine2: "xatosiz.",
    description:
      "ALGO — o'qituvchi va natija o'rtasidagi intellektual qatlam. Biz barcha muntazam ishlarni o'z zimmamizga olamiz, jonli dars berish va iqtidorlarni rivojlantirishga vaqt qoldiramiz.",
    connectCenter: "Markazni ulash",
    howItWorks: "Bu qanday ishlaydi",
    liveDiagnosis: "Jonli diagnostika",
    studentName: "Arslan S.",
    studentInfo: "8-sinf • Diagnostika",
    scoreLabel: "Ball",
    coreAccuracy: "Yadro aniqligi",
    coreAccuracyValue: "99.8%",
    knowledgeGraph: "Bilim grafi",
    knowledgeGraphValue: "2.4k Tugun",
    aiInsightLabel: "AI Tahlil",
    aiInsightPrefix: "Tizimli bo'shliq aniqlandi: ",
    aiInsightHighlight: "Chiziqli funksiyalar",
    aiInsightSuffix: " 7-sinfdan. Davolash paketi yaratildi.",
  },
  journey: {
    title: "Uzluksiz jarayon",
    subtitle: "Birinchi uchrashuvdan kafolatlangan natijagacha.",
    steps: [
      {
        title: "Deep Scan",
        subtitle: "Kirish diagnostikasi",
        desc: "Tizim 15 daqiqada o'quvchining haqiqiy darajasini aniqlaydi, hatto 3 yil oldingi bo'shliqlarni ham topadi.",
      },
      {
        title: "Smart Exam",
        subtitle: "Generatsiya va topshirish",
        desc: "O'qituvchi mavzuni tanlaydi, AI esa ko'chirishdan himoyalangan 50 ta noyob variant yaratadi.",
      },
      {
        title: "Full Audit",
        subtitle: "Tahlil va hisobotlar",
        desc: "Ota-onalar uchun tezkor hisobotlar va markaz ma'muriyati uchun issiqlik xaritalari.",
      },
    ],
  },
  ecosystem: {
    titleLine1: "Yagona ekotizim",
    titleLine2: "butun markaz uchun",
    parts: [
      { name: "Admin Portal", role: "Egalar uchun", desc: "Moliya, davomat va ta'lim sifatini real vaqtda to'liq nazorat qilish." },
      { name: "Teacher Studio", role: "O'qituvchilar uchun", desc: "Avtomatik tekshirish va ko'nikmalar grafi asosida dars konstruktori." },
      { name: "Student App", role: "O'quvchilar uchun", desc: "Shaxsiy trenajyor va materiallarga 24/7 kirish." },
      { name: "Parent View", role: "Ota-onalar uchun", desc: "Shaffof taraqqiyot va bolaning har bir muvaffaqiyati haqida bildirishnomalar." },
    ],
    studentsCount: "~500",
    studentsLabel: "Tizimdagi o'quvchilar",
    secureAi: "Secure AI",
    accuracyValue: "100%",
    accuracyLabel: "Hisoblash aniqligi",
    globalValue: "Global",
    globalLabel: "Scale Ready",
    growthValue: "4.8x",
    growthLabel: "O'zlashtirish o'sishi",
  },
  vision: {
    badge: "Vision 2027",
    titleLine1: "Ta'lim kelajagi —",
    titleLine2: "cho'ntagingizda",
    description:
      "Biz shunchaki xizmat emas, balki bolaning bilimlari haqida hamma narsani biladigan shaxsiy AI-ustoz yaratmoqdamiz.",
    cards: [
      { title: "AI Ustoz 24/7", text: "Har qanday masalaga ovoz yoki video orqali tezkor javob va tushuntirish." },
      { title: "LIFT Metodi", text: "Bo'shliqlarni yopishning eng qisqa yo'li — ortiqcha suv va yodlashsiz." },
      { title: "SAT & Olimpiadalar", text: "Yuqori darajadagi xalqaro testlarga ixtisoslashgan tayyorgarlik." },
    ],
  },
  investors: {
    titleLine1: "Intellektga",
    titleLine2: "investitsiya qiling",
    description:
      "Biz noyob Proprietary IP yaratmoqdamiz — jahon EdTech'da sifat standarti bo'ladigan matematik yadro.",
    businessModelLabel: "Biznes-model",
    businessModelValue: "B2B SaaS + APIaaS",
    ipStatusLabel: "IP Holati",
    ipStatusValue: "2400+ matematik ko'nikmaning noyob grafi",
    requestPitchDeck: "Pitch Deck so'rash",
    stat1Value: "3",
    stat1Label: "Faol pilot loyihalar",
    stat2Value: "99%",
    stat2Label: "B2B Retention Rate",
    stat3Value: "2.4k",
    stat3Label: "Bilim grafidagi tugunlar",
    stat4Value: "Zero",
    stat4Label: "AI Gallyutsinator",
  },
  footer: {
    description: "Kelajak maktablari uchun operatsion tizim. Yaxshiroq va tezroq o'qitishga yordam beradigan texnologiyalar yaratamiz.",
    productsHeading: "Mahsulotlar",
    companyHeading: "Kompaniya",
    legalHeading: "Huquqiy",
    adminPortal: "Admin Portal",
    teacherDashboard: "Teacher Dashboard",
    studentApp: "Student Mobile App",
    apiDocs: "API for Developers",
    technology: "Texnologiya",
    investorsLink: "Investorlar",
    contacts: "Kontaktlar",
    linkedin: "LinkedIn",
    copyright: "© 2026 ALGO EdTech. Built with Intelligence.",
    privacy: "Maxfiylik siyosati",
    terms: "Foydalanish shartlari",
  },
  contact: {
    title: "Biz bilan bog'laning",
    subtitle: "Formani to'ldiring, biz tez orada siz bilan bog'lanamiz.",
    nameLabel: "Ism",
    namePlaceholder: "Ismingiz",
    emailLabel: "Email",
    emailPlaceholder: "email@example.com",
    typeLabel: "So'rov turi",
    typeDemo: "Maktablar uchun demo",
    typePitchDeck: "Pitch Deck so'rash",
    typeConnect: "Markazni ulash",
    messageLabel: "Xabar",
    messagePlaceholder: "O'quv markazingiz haqida gapirib bering…",
    submit: "Yuborish",
    submitting: "Yuborilmoqda…",
    successTitle: "So'rov yuborildi!",
    successMessage: "Tez orada siz bilan bog'lanamiz.",
    errorMessage: "Yuborishda xato. Qaytadan urinib ko'ring.",
    close: "Yopish",
  },
};

export const translations: Record<Locale, Translations> = { ru, en, uz };
