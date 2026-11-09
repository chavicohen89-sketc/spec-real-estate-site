import { z } from "zod";
import { strings } from "@/lib/strings";

const auth = strings.admin.auth.errors;
const editor = strings.admin.editor.errors;

export const loginSchema = z.object({
  email: z.email(auth.email).trim(),
  password: z.string().min(1, auth.password),
});
export type LoginField = keyof z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email(auth.email).trim(),
});
export type ForgotPasswordField = keyof z.infer<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, auth.passwordTooShort).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: auth.passwordMismatch,
  });
export type NewPasswordField = "password" | "confirm";

const MAX_BODY_CHARS = 200_000;

/** מסמך Tiptap: בודקים מבנה בסיסי וגודל. הרינדור עצמו מסנן קישורים לא בטוחים */
export const richTextDoc = z
  .looseObject({
    type: z.literal("doc"),
    content: z.array(z.unknown()).optional(),
  })
  .refine((doc) => JSON.stringify(doc).length <= MAX_BODY_CHARS, editor.body);

export const projectTitleSchema = z
  .string()
  .trim()
  .min(1, editor.title)
  .max(200, editor.titleTooLong);

export const projectSchema = z.object({
  title: projectTitleSchema,
  slug: z
    .string()
    .trim()
    .max(100, editor.slug)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, editor.slug),
  body: richTextDoc.nullable(),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectField = keyof ProjectInput;

export const aboutBodySchema = richTextDoc.nullable();

export const messageHandledSchema = z.boolean();

export const idSchema = z.uuid();
export const idListSchema = z.array(idSchema).max(500);
export const imageAltSchema = z.string().trim().max(300, editor.altTooLong);

/** נתיב קובץ של פרויקט: רק בתיקייה של אותו פרויקט */
export function isProjectImagePath(projectId: string, path: string): boolean {
  return /^[a-zA-Z0-9-]+\.(webp|jpg)$/.test(path.slice(`projects/${projectId}/`.length))
    && path.startsWith(`projects/${projectId}/`);
}

/** נתיב קובץ של עמוד אודות */
export function isAboutImagePath(path: string): boolean {
  return /^about\/[a-zA-Z0-9-]+\.(webp|jpg)$/.test(path);
}
