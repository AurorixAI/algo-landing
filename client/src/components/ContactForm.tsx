import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, CheckCircle2, CircleAlert, Loader2, X } from "lucide-react";
import ContactChallenge, { challengeSiteKey } from "./ContactChallenge";
import {
  EMPTY_APPLY_FORM,
  NEEDS,
  ORG_TYPES,
  POSITIONS,
  STEP_TITLES,
  TOOLS,
  buildCreateBody,
  buildDetailsBody,
  describeFailure,
  firstErrorField,
  firstStepWithErrors,
  validateStep,
  type ApplyErrors,
  type ApplyField,
  type ApplyValues,
  type FailureView,
  type Step,
} from "@/lib/demo-apply";
import { ApiFailure, createDemoRequest, patchDemoRequest, uuid4 } from "@/lib/demo-api";
import { clearDraft, loadDraft, rememberSource, saveDraft, type Draft } from "@/lib/demo-draft";
import { COMMENT_MAX, SUCCESS_STEPS, STUDENTS_MAX, maskPhone, type DemoSource } from "@/lib/demo-form";
import { enterForm, leaveForm, wantsForm } from "@/lib/demo-history";
import "./contact-form.css";

interface ContactFormContextType {
  /** Opens the one request form.  `context` is what the button was about: it goes into the comment. */
  open: (context?: string) => void;
}

const ContactFormContext = createContext<ContactFormContextType>({ open: () => {} });
export const useContactForm = () => useContext(ContactFormContext);

const storage = (() => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
})();

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [context, setContext] = useState("");
  // "restore": the window comes back after a reload / a direct #demo link, so a finished request stays on screen.
  const [restore, setRestore] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const source = useRef<DemoSource | null>(null);
  if (source.current === null) {
    source.current = rememberSource(storage, {
      search: window.location.search,
      pathname: window.location.pathname,
      referrer: document.referrer,
      host: window.location.host,
    });
  }

  const open = useCallback((text = "") => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContext(text);
    setRestore(false);
    enterForm(window);
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    leaveForm(window);
  }, []);

  useEffect(() => {
    if (wantsForm(window)) {
      setRestore(true);
      enterForm(window);
      setOpen(true);
    }
    // «Назад» on a phone: the address no longer has #demo -> the window closes, the draft stays.
    const onPop = () => setOpen(wantsForm(window));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <ContactFormContext.Provider value={{ open }}>
      {children}
      {isOpen && (
        <ContactDialog
          context={context}
          restore={restore}
          source={source.current ?? undefined}
          onClose={close}
          returnFocus={returnFocus.current}
        />
      )}
    </ContactFormContext.Provider>
  );
}

// ---- Copy (Russian only, K3 L5) -------------------------------------------------------------------------------------

const COPY = {
  eyebrow: "ДАВАЙТЕ ПОЗНАКОМИМСЯ",
  title: "ALGO в работе.\nНа вашем примере.",
  description: "Покажем путь от диагностики до работы преподавателя и обсудим задачи вашего центра.",
  close: "Закрыть",
  optional: "необязательно",
  heads: {
    1: { title: "О вашем центре", text: "Начнём с общего: так демо будет ближе к вашей работе." },
    2: { title: "Как с вами связаться", text: "После этого шага заявка уходит команде ALGO. Менеджер свяжется с вами в течение 1 рабочего дня." },
    3: { title: "Расскажите о задачах", text: "Заявка уже принята. Ответы необязательны, но помогут подготовить демо." },
  },
  done: { title: "Заявка принята", text: "Спасибо! Заявка отправлена команде ALGO." },
  privacy: "Используем ваши контакты, чтобы ответить на эту заявку.",
  waitCheck: "Дождитесь окончания проверки ниже и нажмите ещё раз.",
  stepNoteDone: "Заявка уже принята. Дополнение необязательно: расскажете и на звонке.",
  notAdded: "Заявка принята, но дополнить её не получилось. Расскажите о задачах менеджеру на звонке.",
} as const;

// ---- Dialog ---------------------------------------------------------------------------------------------------------

function freshDraft(): Draft {
  return { step: 1, values: { ...EMPTY_APPLY_FORM, needs: [] }, requestId: uuid4(), created: null, context: "", notice: "" };
}

function startDraft(context: string, restore: boolean): Draft {
  let draft = loadDraft(storage);
  if (draft?.step === "done" && !restore) draft = null; // a new request: the old one is finished
  if (!draft) draft = freshDraft();
  // A chapter's button says what the visitor looked at: it becomes the comment unless the visitor wrote their own.
  if (context && draft.step !== "done" && (draft.values.comment === "" || draft.values.comment === draft.context)) {
    draft = { ...draft, context, values: { ...draft.values, comment: context } };
  }
  return draft;
}

function ContactDialog({ context, restore, source, onClose, returnFocus }: {
  context: string;
  restore: boolean;
  source: DemoSource | undefined;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  const id = useId();
  const [draft, setDraft] = useState<Draft>(() => startDraft(context, restore));
  const draftRef = useRef(draft);
  const mounted = useRef(true);
  const busy = useRef(false); // one request at a time: a double click or Enter must not send twice
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<ApplyErrors>({});
  const [banner, setBanner] = useState<FailureView | { kind: "info"; message: string } | null>(null);
  const [token, setToken] = useState("");
  const [challengeReset, setChallengeReset] = useState(0);
  const content = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const { step, values } = draft;

  /** Every change goes to the draft in sessionStorage, even if the window was closed while a request was in flight. */
  const commit = useCallback((update: (d: Draft) => Draft) => {
    const next = update(draftRef.current);
    draftRef.current = next;
    // Once finished, nothing personal stays in the tab; the screen is still restored after a reload.
    saveDraft(storage, next.step === "done" ? { ...next, values: { ...EMPTY_APPLY_FORM, needs: [] }, created: null } : next);
    if (mounted.current) setDraft(next);
  }, []);

  useEffect(() => {
    mounted.current = true;
    commit((d) => d); // a restored or fresh draft is stored at once (the request id must survive a reload)
    return () => { mounted.current = false; };
  }, [commit]);

  // Phone: the sheet follows the visible part of the screen, so the keyboard never covers the focused field or the button.
  useEffect(() => {
    const viewport = window.visualViewport;
    const node = content.current;
    if (!viewport || !node) return;
    const apply = () => {
      node.style.setProperty("--vv-height", `${Math.round(viewport.height)}px`);
      node.style.setProperty("--vv-top", `${Math.round(viewport.offsetTop)}px`);
    };
    const reveal = () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && node.contains(active) && active.matches("input, textarea, select")) {
        active.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      }
    };
    const onResize = () => { apply(); reveal(); };
    const onFocus = () => window.setTimeout(reveal, 280); // after the keyboard has finished opening
    apply();
    viewport.addEventListener("resize", onResize);
    viewport.addEventListener("scroll", apply);
    node.addEventListener("focusin", onFocus);
    return () => {
      viewport.removeEventListener("resize", onResize);
      viewport.removeEventListener("scroll", apply);
      node.removeEventListener("focusin", onFocus);
    };
  }, []);

  const goTo = (next: Step) => {
    setBanner(null);
    commit((d) => ({ ...d, step: next }));
    window.requestAnimationFrame(() => {
      content.current?.querySelector(".contact-scroll")?.scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: true });
    });
  };

  const setField = <K extends keyof ApplyValues>(key: K, value: ApplyValues[K]) => {
    commit((d) => ({ ...d, values: { ...d.values, [key]: value } }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
    if (banner?.kind === "fields") setBanner(null);
  };

  const focusField = (field: ApplyField | undefined) => {
    if (!field) return;
    window.requestAnimationFrame(() => {
      const element = content.current?.querySelector<HTMLElement>(`[data-field="${field}"]`);
      element?.focus();
      element?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    });
  };

  const showFailure = (view: FailureView, current: Step) => {
    const target = view.step ?? current;
    if (target !== current) goTo(target); // clears the banner: so it is set after
    setErrors(view.errors);
    setBanner(view);
    focusField(firstErrorField(target, view.errors));
  };

  const finish = (notice = "") => {
    setErrors({});
    setBanner(null);
    commit((d) => ({ ...d, step: "done", notice, created: null, values: { ...EMPTY_APPLY_FORM, needs: [] } }));
    window.requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  };

  const handleClose = () => {
    if (draftRef.current.step === "done") clearDraft(storage);
    onClose();
  };

  // ---- Step actions ----

  const next = () => {
    const found = validateStep(1, draftRef.current.values);
    setErrors(found);
    if (Object.keys(found).length) { focusField(firstErrorField(1, found)); return; }
    goTo(2);
  };

  const create = async () => {
    if (busy.current) return;
    const current = draftRef.current;
    for (const check of [1, 2] as const) {
      const found = validateStep(check, current.values);
      if (Object.keys(found).length) {
        setErrors(found);
        if (check !== 2) goTo(check);
        focusField(firstErrorField(check, found));
        return;
      }
    }
    if (challengeSiteKey && !token) { setBanner({ kind: "info", message: COPY.waitCheck }); return; }
    busy.current = true;
    setSending(true);
    setErrors({});
    setBanner(null);
    try {
      const created = await createDemoRequest(buildCreateBody(current.values, source, current.requestId, token));
      commit((d) => ({
        ...d,
        requestId: created.requestId,
        created: { id: created.id, token: created.detailsToken, expiresAt: created.detailsTokenExpiresAt },
      }));
      if (created.detailsToken) goTo(3);
      else finish(); // an old request that came back again: nothing can be added to it
    } catch (error) {
      setToken("");
      setChallengeReset((value) => value + 1); // a Turnstile token works once
      if (mounted.current) showFailure(describeFailure(error, 2), 2);
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  };

  const addDetails = async () => {
    if (busy.current) return;
    const current = draftRef.current;
    const found = validateStep(3, current.values);
    setErrors(found);
    if (Object.keys(found).length) { focusField(firstErrorField(3, found)); return; }
    const created = current.created;
    const body = created?.token ? buildDetailsBody(current.values, created.token) : null;
    if (!created || !body) { finish(); return; } // nothing to add
    busy.current = true;
    setSending(true);
    setBanner(null);
    try {
      await patchDemoRequest(created.id, body);
      finish();
    } catch (error) {
      if (error instanceof ApiFailure && [403, 404, 409].includes(error.status)) {
        finish(COPY.notAdded); // the request itself was accepted at step 2
      } else if (mounted.current) {
        showFailure(describeFailure(error, 3), 3);
      }
    } finally {
      busy.current = false;
      if (mounted.current) setSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 1) next();
    else if (step === 2) void create();
    else if (step === 3) void addDetails();
  };

  const isDone = step === "done";
  const head = isDone ? COPY.done : COPY.heads[step];
  const field = (name: ApplyField) => ({
    "data-field": name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="contact-overlay" />
        <Dialog.Content
          ref={content}
          className="contact-dialog"
          onOpenAutoFocus={(event) => { event.preventDefault(); heading.current?.focus({ preventScroll: true }); }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
          }}
        >
          <Dialog.Close className="contact-close" aria-label={COPY.close}>
            <X size={19} aria-hidden="true" />
          </Dialog.Close>

          <aside className="contact-story" aria-hidden="true">
            <span className="contact-wordmark">ALGO</span>
            <div className="contact-story-body">
              <p className="contact-eyebrow">{COPY.eyebrow}</p>
              <h2>{COPY.title}</h2>
              <p className="contact-story-description">{COPY.description}</p>
            </div>
            <div className="contact-journey">
              {([1, 2, 3] as const).map((n) => (
                <div className="contact-journey-step" key={n} data-state={isDone || n < step ? "done" : n === step ? "current" : "todo"}>
                  <span className="contact-step-number">0{n}</span>
                  <span>{STEP_TITLES[n]}</span>
                  <Check size={13} />
                </div>
              ))}
            </div>
            <span className="contact-story-footer">ALGO · EDTECH</span>
          </aside>

          <div className="contact-main">
            <div className="contact-head">
              {isDone ? (
                <span className="contact-state-icon"><CheckCircle2 size={30} aria-hidden="true" /></span>
              ) : (
                <div className="contact-steps" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Шаг ${step} из 3`}>
                  <span className="contact-steps-label">Шаг {step} из 3 · {STEP_TITLES[step]}</span>
                  <span className="contact-steps-bar" aria-hidden="true">
                    {([1, 2, 3] as const).map((n) => <i key={n} data-on={n <= step ? "1" : "0"} />)}
                  </span>
                </div>
              )}
              <Dialog.Title className="contact-title" ref={heading} tabIndex={-1}>{head.title}</Dialog.Title>
              <Dialog.Description className="contact-description">{head.text}</Dialog.Description>
            </div>

            {isDone ? (
              <div className="contact-done" role="status">
                <ol className="contact-next">
                  {SUCCESS_STEPS.map((text, index) => <li key={text}><span>{index + 1}</span>{text}</li>)}
                </ol>
                {draft.notice && <p className="contact-notice"><CircleAlert size={16} aria-hidden="true" />{draft.notice}</p>}
                <div className="contact-actions">
                  <button className="contact-submit" type="button" onClick={handleClose}>{COPY.close}<ArrowRight size={18} aria-hidden="true" /></button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="contact-form" aria-busy={sending} noValidate>
                <div className="contact-honeypot" aria-hidden="true">
                  <label htmlFor={`${id}-website`}>Website</label>
                  <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setField("website", e.target.value)} />
                </div>
                <div className="contact-scroll"><fieldset disabled={sending} className="contact-fields">
                  {step === 1 && (
                    <>
                      <Field id={`${id}-centreName`} label="Название центра" error={errors.centreName}>
                        <input {...field("centreName")} id={`${id}-centreName`} name="organization" type="text" autoComplete="organization" value={values.centreName} maxLength={200} onChange={(e) => setField("centreName", e.target.value)} />
                      </Field>
                      <Field id={`${id}-orgType`} label="Тип организации" error={errors.orgType}>
                        <select {...field("orgType")} id={`${id}-orgType`} name="org_type" value={values.orgType} onChange={(e) => setField("orgType", e.target.value as ApplyValues["orgType"])}>
                          <option value="">Выберите…</option>
                          {ORG_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </Field>
                      <Field id={`${id}-city`} label="Город" error={errors.city}>
                        <input {...field("city")} id={`${id}-city`} name="city" type="text" autoComplete="address-level2" value={values.city} maxLength={100} onChange={(e) => setField("city", e.target.value)} />
                      </Field>
                      <Field id={`${id}-address`} label="Адрес" optional error={errors.address}>
                        <input {...field("address")} id={`${id}-address`} name="center_address" type="text" autoComplete="off" value={values.address} maxLength={300} onChange={(e) => setField("address", e.target.value)} />
                      </Field>
                      <Field id={`${id}-studentsCount`} label="Сколько учеников (примерно)" optional error={errors.studentsCount}>
                        <input {...field("studentsCount")} id={`${id}-studentsCount`} name="students_count" type="text" inputMode="numeric" autoComplete="off" value={values.studentsCount} placeholder="Например, 120" onChange={(e) => setField("studentsCount", e.target.value.replace(/\D/g, "").slice(0, String(STUDENTS_MAX).length))} />
                      </Field>
                      <Field id={`${id}-branchesCount`} label="Филиалы" optional error={errors.branchesCount} group>
                        <div className="contact-chips" role="radiogroup" aria-labelledby={`${id}-branchesCount-label`}>
                          <Chip type="radio" name={`${id}-branches`} checked={values.branchesMode === "none"} onChange={() => setField("branchesMode", "none")} label="Нет" />
                          <Chip type="radio" name={`${id}-branches`} checked={values.branchesMode === "some"} onChange={() => setField("branchesMode", "some")} label="Есть" />
                        </div>
                        {values.branchesMode === "some" && (
                          <input {...field("branchesCount")} className="contact-branches" aria-label="Сколько филиалов" type="text" inputMode="numeric" autoComplete="off" value={values.branchesCount} placeholder="Сколько филиалов" onChange={(e) => setField("branchesCount", e.target.value.replace(/\D/g, "").slice(0, 3))} />
                        )}
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Field id={`${id}-fullName`} label="Ваше имя" error={errors.fullName}>
                        <input {...field("fullName")} id={`${id}-fullName`} name="name" type="text" autoComplete="name" value={values.fullName} maxLength={120} onChange={(e) => setField("fullName", e.target.value)} />
                      </Field>
                      <Field id={`${id}-position`} label="Должность" optional error={errors.position}>
                        <select {...field("position")} id={`${id}-position`} name="position" value={values.position} onChange={(e) => setField("position", e.target.value as ApplyValues["position"])}>
                          <option value="">Выберите…</option>
                          {POSITIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </Field>
                      <Field id={`${id}-phone`} label="Телефон" error={errors.phone}>
                        <input {...field("phone")} id={`${id}-phone`} name="tel" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} placeholder="+998 90 123 45 67" onChange={(e) => setField("phone", maskPhone(e.target.value))} />
                      </Field>
                      <Field id={`${id}-email`} label="Почта" error={errors.email}>
                        <input {...field("email")} id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" value={values.email} placeholder="name@center.uz" maxLength={254} onChange={(e) => setField("email", e.target.value)} />
                      </Field>
                      <Field id={`${id}-contactTime`} label="Удобное время для звонка" optional error={errors.contactTime}>
                        <input {...field("contactTime")} id={`${id}-contactTime`} name="contact_time" type="text" autoComplete="off" value={values.contactTime} maxLength={100} placeholder="Например, после 15:00" onChange={(e) => setField("contactTime", e.target.value)} />
                      </Field>
                      {challengeSiteKey && <ContactChallenge onToken={setToken} reset={challengeReset} />}
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Field id={`${id}-needs`} label="Что для вас важно" optional error={errors.needs} group>
                        <div className="contact-chips" role="group" aria-labelledby={`${id}-needs-label`} data-field="needs" tabIndex={-1}>
                          {NEEDS.map((n) => (
                            <Chip key={n.value} type="checkbox" name={`${id}-needs`} checked={values.needs.includes(n.value)} label={n.label}
                              onChange={() => setField("needs", values.needs.includes(n.value) ? values.needs.filter((x) => x !== n.value) : [...values.needs, n.value])} />
                          ))}
                        </div>
                      </Field>
                      <Field id={`${id}-currentTool`} label="Чем пользуетесь сейчас" optional error={errors.currentTool} group>
                        <div className="contact-chips" role="radiogroup" aria-labelledby={`${id}-currentTool-label`} data-field="currentTool" tabIndex={-1}>
                          {TOOLS.map((t) => (
                            <Chip key={t.value} type="radio" name={`${id}-tool`} checked={values.currentTool === t.value} label={t.label} onChange={() => setField("currentTool", t.value)} />
                          ))}
                        </div>
                      </Field>
                      <Field id={`${id}-heardFrom`} label="Откуда узнали об ALGO" optional error={errors.heardFrom}>
                        <input {...field("heardFrom")} id={`${id}-heardFrom`} name="heard_from" type="text" autoComplete="off" value={values.heardFrom} maxLength={200} placeholder="Например, рекомендация коллег" onChange={(e) => setField("heardFrom", e.target.value)} />
                      </Field>
                      <Field id={`${id}-comment`} label="Комментарий" optional error={errors.comment}>
                        <textarea {...field("comment")} id={`${id}-comment`} name="comment" value={values.comment} maxLength={COMMENT_MAX} rows={3} placeholder="Ваш центр, роль или задача, которую хотите обсудить…" onChange={(e) => setField("comment", e.target.value)} />
                      </Field>
                    </>
                  )}
                </fieldset></div>

                <div className="contact-footer">
                  {banner && (
                    <p className={`contact-error${banner.kind === "info" ? " contact-error-info" : ""}`} role="alert">
                      <CircleAlert size={16} aria-hidden="true" />{banner.message}
                    </p>
                  )}
                  <div className="contact-actions">
                    {step === 2 && <button type="button" className="contact-secondary" disabled={sending} onClick={() => goTo(1)}>Назад</button>}
                    {step === 3 && <button type="button" className="contact-secondary" disabled={sending} onClick={() => finish()}>Пропустить</button>}
                    <button type="submit" className="contact-submit" disabled={sending}>
                      {sending ? "Отправляем…" : step === 1 ? "Дальше" : step === 2 ? "Отправить заявку" : "Дополнить"}
                      {sending ? <Loader2 className="contact-spinner" size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {step === 2 && <p className="contact-privacy">{COPY.privacy}</p>}
                  {step === 3 && <p className="contact-privacy">{COPY.stepNoteDone}</p>}
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ id, label, optional = false, error, group = false, children }: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  /** A group of choices: the label is not tied to one control. */
  group?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="contact-field" data-invalid={error ? "1" : undefined}>
      {group
        ? <span className="contact-label" id={`${id}-label`}>{label}{optional && <span>{COPY.optional}</span>}</span>
        : <label className="contact-label" htmlFor={id}>{label}{optional && <span>{COPY.optional}</span>}</label>}
      {children}
      {error && <p className="contact-field-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

function Chip({ type, name, checked, label, onChange }: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="contact-chip" data-checked={checked ? "1" : "0"}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
