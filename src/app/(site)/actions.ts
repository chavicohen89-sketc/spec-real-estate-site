"use server";

import { getRequestIp } from "@/lib/request-ip";
import { strings } from "@/lib/strings";
import { contactSchema, type ContactField } from "@/lib/validation/contact";
import { toFieldErrors, type FormState } from "@/lib/validation/form-state";
import { subscribeSchema, type SubscribeField } from "@/lib/validation/subscribe";
import { unsubscribeTokenSchema } from "@/lib/validation/unsubscribe";
import { saveContactMessage } from "@/server/contact";
import { subscribe, unsubscribe } from "@/server/subscribers";

const t = strings.forms.errors;
const HONEYPOT_FIELD = "website";

/** הערכים להחזרה לטופס אחרי שגיאה, בלי שדות פנימיים של React והמלכודת */
function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$") && key !== HONEYPOT_FIELD) {
      values[key] = value;
    }
  }
  return values;
}

// בוט שמילא את המלכודת מקבל "הצלחה", כדי שלא ילמד שנתפס
const isBot = (formData: FormData) => Boolean(formData.get(HONEYPOT_FIELD));

export async function subscribeAction(
  _prev: FormState<SubscribeField>,
  formData: FormData,
): Promise<FormState<SubscribeField>> {
  if (isBot(formData)) return { status: "success" };

  const values = formValues(formData);
  const parsed = subscribeSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  try {
    const result = await subscribe(parsed.data, await getRequestIp());
    if (result === "ok") return { status: "success" };
    return {
      status: "error",
      formError: result === "rate_limited" ? t.rateLimited : t.generic,
      values,
    };
  } catch (error) {
    console.error("subscribe failed", error);
    return { status: "error", formError: t.generic, values };
  }
}

export async function contactAction(
  _prev: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  if (isBot(formData)) return { status: "success" };

  const values = formValues(formData);
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values };
  }

  try {
    const result = await saveContactMessage(parsed.data, await getRequestIp());
    if (result === "ok") return { status: "success" };
    return { status: "error", formError: t.rateLimited, values };
  } catch (error) {
    console.error("contact failed", error);
    return { status: "error", formError: t.generic, values };
  }
}

export async function unsubscribeAction(
  _prev: FormState<never>,
  formData: FormData,
): Promise<FormState<never>> {
  const token = unsubscribeTokenSchema.safeParse(formData.get("token"));
  if (!token.success) return { status: "error", formError: strings.unsubscribe.invalidLink };

  try {
    const result = await unsubscribe(token.data);
    if (result === "ok") return { status: "success" };
    return { status: "error", formError: strings.unsubscribe.invalidLink };
  } catch (error) {
    console.error("unsubscribe failed", error);
    return { status: "error", formError: t.generic };
  }
}
