import { createContext, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, CheckCircle2, CircleAlert, Loader2, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import "./contact-form.css";
import ContactChallenge, { challengeSiteKey } from "./ContactChallenge";

type ContactType = "demo" | "pitchDeck" | "connect";
type SubmissionStatus = "idle" | "submitting" | "success" | "preview" | "error";

interface ContactFormContextType {
  open: (type: ContactType, context?: string) => void;
}

const ContactFormContext = createContext<ContactFormContextType>({ open: () => {} });
export const useContactForm = () => useContext(ContactFormContext);

const copy = {
  ru: {
    eyebrow: "ДАВАЙТЕ ПОЗНАКОМИМСЯ",
    title: "ALGO в работе.\nНа вашем примере.",
    description: "Покажем путь от диагностики до работы преподавателя и обсудим задачи вашего центра.",
    steps: ["Диагностика знаний", "Понятный результат", "Работа преподавателя"],
    demo: "Посмотреть ALGO",
    connect: "Обсудить подключение",
    pitchDeck: "Запросить презентацию",
    formDescription: "Оставьте контакты и пару слов о себе. Так мы сможем подготовить полезный разговор.",
    optional: "необязательно",
    messagePlaceholder: "Ваш центр, роль или задача, которую хотите обсудить…",
    submit: "Отправить заявку",
    privacy: "Используем ваши контакты, чтобы ответить на этот запрос.",
    successTitle: "Заявка отправлена",
    successDescription: "Ваш запрос передан команде ALGO. Ответим на указанный email.",
    previewTitle: "Отправка пока недоступна",
    previewDescription: "Приём заявок временно недоступен. Ваше сообщение не отправлено команде ALGO. Попробуйте позже.",
    back: "Вернуться к форме",
    error: "Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.",
    nameError: "Укажите ваше имя.",
    limited: "Слишком много попыток. Подождите несколько минут перед повторной отправкой.",
    verification: "Подтвердите проверку перед отправкой. Если она недоступна, попробуйте позже.",
    collaborationTitle: "Начнём\nс разговора.",
    collaborationDescription: "Расскажите, что вас интересует в ALGO. Обсудим продукт и подходящий формат сотрудничества.",
    collaborationSteps: ["Продукт и возможности", "Задачи вашей команды", "Следующий шаг вместе"],
  },
  en: {
    eyebrow: "LET’S GET ACQUAINTED",
    title: "ALGO in action.\nFor your team.",
    description: "Explore the journey from assessment to a teacher’s daily work, with your centre’s needs in mind.",
    steps: ["Knowledge assessment", "Clear results", "A teacher’s workflow"],
    demo: "Explore ALGO",
    connect: "Discuss getting started",
    pitchDeck: "Request a presentation",
    formDescription: "Leave your details and a little context so we can prepare a useful conversation.",
    optional: "optional",
    messagePlaceholder: "Your centre, role, or a question you’d like to discuss…",
    submit: "Send request",
    privacy: "We use your contact details to respond to this request.",
    successTitle: "Request sent",
    successDescription: "Your request has been sent to the ALGO team. We’ll reply to the email you provided.",
    previewTitle: "Sending is not available yet",
    previewDescription: "Requests are temporarily unavailable. Your message has not been sent to the ALGO team. Please try again later.",
    back: "Back to the form",
    error: "We couldn’t send your request. Check your connection and try again.",
    nameError: "Please enter your name.",
    limited: "Too many attempts. Please wait a few minutes before trying again.",
    verification: "Complete the verification before sending. If it is unavailable, try again later.",
    collaborationTitle: "It starts with\na conversation.",
    collaborationDescription: "Tell us what interests you about ALGO. Let’s discuss the product and how we could work together.",
    collaborationSteps: ["Product and capabilities", "Your team’s needs", "A next step together"],
  },
  uz: {
    eyebrow: "KELING, TANISHAMIZ",
    title: "ALGO amalda.\nSizning misolingizda.",
    description: "Diagnostikadan o‘qituvchining kundalik ishigacha bo‘lgan jarayonni ko‘rsatamiz va markazingiz ehtiyojlarini muhokama qilamiz.",
    steps: ["Bilim diagnostikasi", "Tushunarli natija", "O‘qituvchining ish jarayoni"],
    demo: "ALGO bilan tanishish",
    connect: "Ulanishni muhokama qilish",
    pitchDeck: "Taqdimot so‘rash",
    formDescription: "Kontaktlaringizni va o‘zingiz haqingizda qisqacha ma’lumot qoldiring. Bu suhbatga tayyorlanishimizga yordam beradi.",
    optional: "ixtiyoriy",
    messagePlaceholder: "Markazingiz, rolingiz yoki muhokama qilmoqchi bo‘lgan masalangiz…",
    submit: "So‘rov yuborish",
    privacy: "Kontaktlaringizdan ushbu so‘rovga javob berish uchun foydalanamiz.",
    successTitle: "So‘rov yuborildi",
    successDescription: "So‘rovingiz ALGO jamoasiga yuborildi. Ko‘rsatgan emailingizga javob beramiz.",
    previewTitle: "Yuborish hali mavjud emas",
    previewDescription: "So‘rovlarni qabul qilish vaqtincha mavjud emas. Xabaringiz ALGO jamoasiga yuborilmadi. Keyinroq qayta urinib ko‘ring.",
    back: "Shaklga qaytish",
    error: "So‘rov yuborilmadi. Internet aloqasini tekshiring va qayta urinib ko‘ring.",
    nameError: "Ismingizni kiriting.",
    limited: "Urinishlar juda ko‘p. Qayta yuborishdan oldin bir necha daqiqa kuting.",
    verification: "Yuborishdan oldin tekshiruvni bajaring. U mavjud bo‘lmasa, keyinroq urinib ko‘ring.",
    collaborationTitle: "Hammasi\nsuhbatdan boshlanadi.",
    collaborationDescription: "ALGO haqida sizni nima qiziqtirishini ayting. Mahsulot va hamkorlik imkoniyatlarini muhokama qilamiz.",
    collaborationSteps: ["Mahsulot imkoniyatlari", "Jamoangiz ehtiyojlari", "Birgalikdagi keyingi qadam"],
  },
};

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [contactType, setContactType] = useState<ContactType | null>(null);
  const [context, setContext] = useState("");
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = (type: ContactType, initialContext = "") => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContactType(type);
    setContext(initialContext);
  };

  return (
    <ContactFormContext.Provider value={{ open }}>
      {children}
      {contactType && (
        <ContactDialog
          type={contactType}
          initialContext={context}
          onClose={() => setContactType(null)}
          returnFocus={returnFocus.current}
        />
      )}
    </ContactFormContext.Provider>
  );
}

function ContactDialog({ type, initialContext, onClose, returnFocus }: {
  type: ContactType;
  initialContext: string;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  const { t, locale } = useTranslation();
  const content = copy[locale];
  const id = useId();
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialContext);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeReset, setChallengeReset] = useState(0);
  const [errorKind, setErrorKind] = useState<"error" | "limited" | "verification">("error");
  const request = useRef<AbortController | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const isComplete = status === "success" || status === "preview";
  const isCollaboration = type === "pitchDeck";

  useEffect(() => () => request.current?.abort(), []);

  const handleClose = () => {
    request.current?.abort();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting" || request.current) return;
    if (!name.trim()) {
      nameInput.current?.setCustomValidity(content.nameError);
      nameInput.current?.reportValidity();
      return;
    }

    if (challengeSiteKey && !turnstileToken) { setErrorKind("verification"); setStatus("error"); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    request.current = controller;
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), type, website, turnstileToken }),
        signal: controller.signal,
      });
      const result: { ok?: boolean; error?: string } = await response.json();
      if (controller.signal.aborted) return;
      if (result.error === "delivery_unavailable") { setStatus("preview"); return; }
      if (!response.ok || result.ok !== true) {
        setErrorKind(response.status === 429 ? "limited" : result.error?.startsWith("verification_") ? "verification" : "error");
        setStatus("error");
        setChallengeReset(value => value + 1);
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      if (request.current === controller) { setErrorKind("error"); setStatus("error"); setChallengeReset(value => value + 1); }
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  };

  const heading = status === "success" ? content.successTitle : status === "preview" ? content.previewTitle : content[type];
  const description = status === "success" ? content.successDescription : status === "preview" ? content.previewDescription : content.formDescription;

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="contact-overlay" />
        <Dialog.Content
          className="contact-dialog"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
          }}
        >
          <Dialog.Close className="contact-close" aria-label={t.contact.close}>
            <X size={19} aria-hidden="true" />
          </Dialog.Close>

          <aside className="contact-story" aria-hidden="true">
            <span className="contact-wordmark">ALGO</span>
            <div className="contact-story-body">
              <p className="contact-eyebrow">{content.eyebrow}</p>
              <h2>{isCollaboration ? content.collaborationTitle : content.title}</h2>
              <p className="contact-story-description">{isCollaboration ? content.collaborationDescription : content.description}</p>
            </div>
            <div className="contact-journey">
              {(isCollaboration ? content.collaborationSteps : content.steps).map((step, index) => (
                <div className="contact-journey-step" key={step}>
                  <span className="contact-step-number">0{index + 1}</span>
                  <span>{step}</span>
                  <Check size={13} />
                </div>
              ))}
            </div>
            <span className="contact-story-footer">ALGO · EDTECH</span>
          </aside>

          <div className={`contact-main${isComplete ? " contact-main-complete" : ""}`}>
            {isComplete && (
              <span className={`contact-state-icon${status === "preview" ? " contact-state-preview" : ""}`}>
                {status === "success" ? <CheckCircle2 size={30} aria-hidden="true" /> : <CircleAlert size={30} aria-hidden="true" />}
              </span>
            )}
            <div className="contact-form-heading" role={isComplete ? "status" : undefined}>
              {!isComplete && <span className="contact-section-label">{t.contact.typeLabel}</span>}
              <Dialog.Title className="contact-title">{heading}</Dialog.Title>
              <Dialog.Description className="contact-description">{description}</Dialog.Description>
            </div>

            {isComplete ? (
              <button
                className="contact-submit contact-complete-button"
                type="button"
                onClick={status === "success" ? handleClose : () => { setStatus("idle"); setChallengeReset(value => value + 1); }}
              >
                {status === "success" ? t.contact.close : content.back}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" aria-busy={status === "submitting"}>
                <div className="contact-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)}/></div>
                <fieldset disabled={status === "submitting"} className="contact-fields">
                  <div className="contact-field">
                    <label htmlFor={`${id}-name`}>{t.contact.nameLabel}</label>
                    <input
                      ref={nameInput}
                      id={`${id}-name`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => {
                        event.target.setCustomValidity("");
                        setName(event.target.value);
                      }}
                      placeholder={t.contact.namePlaceholder}
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor={`${id}-email`}>{t.contact.emailLabel}</label>
                    <input
                      id={`${id}-email`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      maxLength={320}
                      pattern={"[^\\s@]+@[^\\s@]+\\.[^\\s@]+"}
                      required
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor={`${id}-message`}>{t.contact.messageLabel}<span>{content.optional}</span></label>
                    <textarea
                      id={`${id}-message`}
                      name="message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={content.messagePlaceholder}
                      maxLength={2000}
                      rows={3}
                    />
                  </div>
                </fieldset>

                {challengeSiteKey && <ContactChallenge onToken={setTurnstileToken} reset={challengeReset}/>}
                {status === "error" && <p className="contact-error" role="alert"><CircleAlert size={16} aria-hidden="true" />{content[errorKind]}</p>}

                <button type="submit" disabled={status === "submitting" || Boolean(challengeSiteKey && !turnstileToken)} className="contact-submit">
                  {status === "submitting" ? t.contact.submitting : content.submit}
                  {status === "submitting" ? <Loader2 className="contact-spinner" size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                </button>
                <p className="contact-privacy">{content.privacy}</p>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
