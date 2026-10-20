export type Locale = "ru" | "en" | "uz";

export interface Translations {
  contact: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    messageLabel: string;
    typeLabel: string;
    submitting: string;
    close: string;
  };
}

export const translations: Record<Locale, Translations> = {
  "ru": {
    "contact": {
      "nameLabel": "Имя",
      "namePlaceholder": "Ваше имя",
      "emailLabel": "Email",
      "messageLabel": "Сообщение",
      "typeLabel": "Тип запроса",
      "submitting": "Отправка…",
      "close": "Закрыть"
    }
  },
  "en": {
    "contact": {
      "nameLabel": "Name",
      "namePlaceholder": "Your name",
      "emailLabel": "Email",
      "messageLabel": "Message",
      "typeLabel": "Request type",
      "submitting": "Submitting…",
      "close": "Close"
    }
  },
  "uz": {
    "contact": {
      "nameLabel": "Ism",
      "namePlaceholder": "Ismingiz",
      "emailLabel": "Email",
      "messageLabel": "Xabar",
      "typeLabel": "So'rov turi",
      "submitting": "Yuborilmoqda…",
      "close": "Yopish"
    }
  }
};
