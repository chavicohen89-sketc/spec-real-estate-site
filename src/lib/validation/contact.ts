import { z } from "zod";
import { normalizeIsraeliPhone } from "@/lib/phone";
import { strings } from "@/lib/strings";
import { emailField, fullNameField } from "./fields";

const t = strings.forms.errors;

export const contactSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  // רשות, אבל אם מולא חייב להיות תקין
  phone: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value?.trim()) return null;
      const phone = normalizeIsraeliPhone(value);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: t.phone });
        return z.NEVER;
      }
      return phone;
    }),
  message: z
    .string({ error: t.message })
    .trim()
    .min(2, t.message)
    .max(5000, t.messageTooLong),
});

export type ContactInput = z.output<typeof contactSchema>;
export type ContactField = "fullName" | "email" | "phone" | "message";
