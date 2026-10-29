/**
 * Demo request in three steps (K3 L1): fields of steps 1-3, per-step checks, request bodies and what a failure means.
 *
 * Phone mask, field checks, `source` (utm) and the base request body come from `demo-form.ts`, a verbatim copy of the product's
 * portable module (LESSONS_LEARNED 39: no second implementation).  This file only adds what the three steps need on top.
 * No React and no window here, so node --test runs it as it is.
 */
import {
  EMPTY_DEMO_FORM,
  buildDemoBody,
  classifyDemoFailure,
  validateDemoForm,
  type DemoErrors,
  type DemoFormValues,
  type DemoRequestBody,
  type DemoSource,
} from "./demo-form";

export type Step = 1 | 2 | 3;

// ---- Options (the lists of K3_API.md section 1) ---------------------------------------------------------------------

export const ORG_TYPES = [
  { value: "center", label: "Учебный центр" },
  { value: "private_school", label: "Частная школа" },
  { value: "university", label: "Университет" },
  { value: "tutoring_center", label: "Репетиторский центр" },
  { value: "tutor", label: "Репетитор" },
  { value: "other", label: "Другое" },
] as const;
export type OrgType = (typeof ORG_TYPES)[number]["value"];

export const POSITIONS = [
  { value: "owner", label: "Владелец" },
  { value: "director", label: "Директор" },
  { value: "admin", label: "Администратор" },
  { value: "other", label: "Другое" },
] as const;
export type Position = (typeof POSITIONS)[number]["value"];

export const NEEDS = [
  { value: "payments", label: "Оплаты и долги" },
  { value: "attendance", label: "Посещаемость" },
  { value: "payroll", label: "Зарплата учителей" },
  { value: "diagnostics", label: "Диагностика" },
  { value: "exams", label: "Экзамены" },
] as const;
export type Need = (typeof NEEDS)[number]["value"];

export const TOOLS = [
  { value: "excel", label: "Excel" },
  { value: "notebook", label: "Тетрадь" },
  { value: "other_system", label: "Другая система" },
  { value: "none", label: "Ничего" },
] as const;
export type Tool = (typeof TOOLS)[number]["value"];

export const ADDRESS_MAX = 300;
export const CONTACT_TIME_MAX = 100;
export const HEARD_FROM_MAX = 200;
export const BRANCHES_MAX = 999;

// ---- Values ---------------------------------------------------------------------------------------------------------

export interface ApplyValues extends DemoFormValues {
  orgType: OrgType | "";
  address: string;
  /** "" = not answered, "none" = no branches (sent as 0), "some" = `branchesCount` branches. */
  branchesMode: "" | "none" | "some";
  /** Digits only. */
  branchesCount: string;
  position: Position | "";
  contactTime: string;
  needs: Need[];
  currentTool: Tool | "";
  heardFrom: string;
}

export const EMPTY_APPLY_FORM: ApplyValues = {
  ...EMPTY_DEMO_FORM,
  orgType: "",
  address: "",
  branchesMode: "",
  branchesCount: "",
  position: "",
  contactTime: "",
  needs: [],
  currentTool: "",
  heardFrom: "",
};

export type ApplyField =
  | keyof Omit<DemoFormValues, "website">
  | "orgType"
  | "address"
  | "branchesCount"
  | "position"
  | "contactTime"
  | "needs"
  | "currentTool"
  | "heardFrom";
export type ApplyErrors = Partial<Record<ApplyField, string>>;

/** Which step shows which field (also the order in which an error is looked for). */
export const STEP_FIELDS: Record<Step, readonly ApplyField[]> = {
  1: ["centreName", "orgType", "city", "address", "studentsCount", "branchesCount"],
  2: ["fullName", "position", "phone", "email", "contactTime"],
  3: ["needs", "currentTool", "heardFrom", "comment"],
};

export const STEP_TITLES: Record<Step, string> = { 1: "О центре", 2: "Контакт", 3: "Задачи" };

export function stepOfField(field: ApplyField): Step {
  for (const step of [1, 2, 3] as const) if (STEP_FIELDS[step].includes(field)) return step;
  return 3;
}

/** The earliest step that has an error; `fallback` when no field is named. */
export function firstStepWithErrors(errors: ApplyErrors, fallback: Step): Step {
  for (const step of [1, 2, 3] as const) if (STEP_FIELDS[step].some((field) => errors[field])) return step;
  return fallback;
}

export function firstErrorField(step: Step, errors: ApplyErrors): ApplyField | undefined {
  return STEP_FIELDS[step].find((field) => errors[field]);
}

/** Client-side check of one step; the server stays the authority. */
export function validateStep(step: Step, values: ApplyValues): ApplyErrors {
  const base: DemoErrors = validateDemoForm(values);
  const errors: ApplyErrors = {};
  for (const field of STEP_FIELDS[step]) {
    const message = (base as ApplyErrors)[field];
    if (message) errors[field] = message;
  }
  if (step === 1) {
    if (!values.orgType) errors.orgType = "Выберите тип организации";
    if (values.address.trim().length > ADDRESS_MAX) errors.address = `Не больше ${ADDRESS_MAX} символов`;
    if (values.branchesMode === "some") {
      const n = Number(values.branchesCount);
      if (values.branchesCount === "" || !Number.isInteger(n) || n < 1 || n > BRANCHES_MAX) {
        errors.branchesCount = `Число от 1 до ${BRANCHES_MAX}`;
      }
    }
  }
  if (step === 2 && values.contactTime.trim().length > CONTACT_TIME_MAX) {
    errors.contactTime = `Не больше ${CONTACT_TIME_MAX} символов`;
  }
  if (step === 3 && values.heardFrom.trim().length > HEARD_FROM_MAX) {
    errors.heardFrom = `Не больше ${HEARD_FROM_MAX} символов`;
  }
  return errors;
}

/** Whether the visitor typed anything (a draft that is still empty is not worth restoring). */
export function isUntouched(values: ApplyValues): boolean {
  const fresh: ApplyValues = EMPTY_APPLY_FORM;
  return (Object.keys(fresh) as (keyof ApplyValues)[]).every((key) => {
    if (key === "website") return true;
    const a = values[key];
    const b = fresh[key];
    return Array.isArray(a) ? a.length === 0 : a === b;
  });
}

// ---- Request bodies -------------------------------------------------------------------------------------------------

/** `POST /api/v1/public/demo-requests`: steps 1-2 (K3_API.md section 1); keys are snake_case. */
export interface CreateBody extends DemoRequestBody {
  request_id: string;
  locale: "ru";
  org_type?: OrgType;
  address?: string;
  branches_count?: number;
  position?: Position;
  preferred_contact_time?: string;
  turnstile_token?: string;
}

export function buildCreateBody(values: ApplyValues, source: DemoSource | undefined, requestId: string, turnstileToken: string): CreateBody {
  const body: CreateBody = { ...buildDemoBody(values, source), request_id: requestId, locale: "ru" };
  if (values.orgType) body.org_type = values.orgType;
  const address = values.address.trim();
  if (address) body.address = address;
  if (values.branchesMode === "none") body.branches_count = 0;
  else if (values.branchesMode === "some" && values.branchesCount !== "") body.branches_count = Number(values.branchesCount);
  if (values.position) body.position = values.position;
  const time = values.contactTime.trim();
  if (time) body.preferred_contact_time = time;
  if (turnstileToken) body.turnstile_token = turnstileToken;
  return body;
}

/** `PATCH /api/v1/public/demo-requests/{id}`: step 3.  Only what the visitor filled in; null = nothing to add. */
export interface DetailsBody {
  details_token: string;
  needs?: Need[];
  current_tool?: Tool;
  heard_from?: string;
  comment?: string;
}

export function buildDetailsBody(values: ApplyValues, token: string): DetailsBody | null {
  const body: DetailsBody = { details_token: token };
  const needs = NEEDS.map((n) => n.value).filter((n) => values.needs.includes(n));
  if (needs.length) body.needs = needs;
  if (values.currentTool) body.current_tool = values.currentTool;
  const heard = values.heardFrom.trim();
  if (heard) body.heard_from = heard;
  const comment = values.comment.trim();
  if (comment) body.comment = comment;
  return Object.keys(body).length > 1 ? body : null;
}

// ---- Failures -------------------------------------------------------------------------------------------------------

/** The shape of a failed request (`ApiFailure` of demo-api.ts has it). */
export interface FailureShape {
  status: number;
  message: string;
  code?: string;
  fields?: Record<string, string>;
  retryAfter?: number;
}

export type FailureKind = "fields" | "rate_limited" | "network" | "server" | "captcha" | "outdated" | "conflict";

export interface FailureView {
  kind: FailureKind;
  /** The banner text. */
  message: string;
  errors: ApplyErrors;
  /** The step to show so the visitor sees the field. */
  step?: Step;
  retryAfter?: number;
}

/** Server field names of the new fields -> form fields (the old ones are mapped by `classifyDemoFailure`). */
const EXTRA_FIELD_OF_SERVER: Record<string, ApplyField> = {
  org_type: "orgType",
  address: "address",
  branches_count: "branchesCount",
  position: "position",
  preferred_contact_time: "contactTime",
  needs: "needs",
  current_tool: "currentTool",
  heard_from: "heardFrom",
};

function shapeOf(failure: unknown): FailureShape | null {
  return typeof failure === "object" && failure !== null && typeof (failure as FailureShape).status === "number"
    ? (failure as FailureShape)
    : null;
}

/** Everything the form needs after a failed create/patch: banner text, field messages and the step to show. */
export function describeFailure(failure: unknown, currentStep: Step): FailureView {
  const shape = shapeOf(failure);
  if (shape?.code === "captcha_failed") {
    return { kind: "captcha", errors: {}, message: "Проверка не пройдена. Пройдите её ещё раз и отправьте заявку заново." };
  }
  if (shape?.code === "unknown_fields") {
    return { kind: "outdated", errors: {}, message: "Страница устарела. Обновите её и отправьте заявку ещё раз: введённое сохранено." };
  }
  if (shape?.code === "request_id_conflict") {
    return { kind: "conflict", errors: {}, message: "Не удалось отправить заявку. Обновите страницу и отправьте ещё раз: введённое сохранено." };
  }
  const base = classifyDemoFailure(failure);
  const errors: ApplyErrors = {};
  if (base.kind === "fields") Object.assign(errors, base.errors);
  let extra = false;
  if (shape && (shape.status === 400 || shape.status === 422)) {
    for (const [name, text] of Object.entries(shape.fields ?? {})) {
      const field = EXTRA_FIELD_OF_SERVER[name];
      if (field) {
        errors[field] = text;
        extra = true;
      }
    }
  }
  const matched = Object.keys(errors).length > 0;
  if (base.kind === "fields") {
    return {
      kind: "fields",
      errors,
      step: matched ? firstStepWithErrors(errors, currentStep) : undefined,
      message: matched || extra ? "Проверьте отмеченные поля." : base.message,
    };
  }
  return {
    kind: base.kind,
    errors,
    message: base.message,
    retryAfter: base.kind === "rate_limited" ? base.retryAfter : undefined,
  };
}
