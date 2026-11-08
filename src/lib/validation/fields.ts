import { z } from "zod";
import { normalizeIsraeliPhone } from "@/lib/phone";
import { strings } from "@/lib/strings";

const t = strings.forms.errors;

export const fullNameField = z
  .string({ error: t.fullName })
  .trim()
  .min(2, t.fullName)
  .max(120, t.fullNameTooLong);

export const emailField = z
  .string({ error: t.email })
  .trim()
  .toLowerCase()
  .max(254, t.email)
  .pipe(z.email(t.email));

export const phoneField = z
  .string({ error: t.phone })
  .transform((value, ctx) => {
    const phone = normalizeIsraeliPhone(value);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: t.phone });
      return z.NEVER;
    }
    return phone;
  });
