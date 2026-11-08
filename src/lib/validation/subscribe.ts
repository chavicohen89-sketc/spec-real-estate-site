import { z } from "zod";
import { strings } from "@/lib/strings";
import { emailField, fullNameField, phoneField } from "./fields";

export const subscribeSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  phone: phoneField,
  emailConsent: z.literal("on", { error: strings.forms.errors.emailConsent }),
  whatsappConsent: z
    .literal("on")
    .optional()
    .transform((value) => value === "on"),
  projectId: z.uuid().optional(),
});

export type SubscribeInput = z.output<typeof subscribeSchema>;
export type SubscribeField = "fullName" | "email" | "phone" | "emailConsent";
