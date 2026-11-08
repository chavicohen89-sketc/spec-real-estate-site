import type { z } from "zod";

/** המצב שמוחזר מ-Server Action של טופס אל useActionState */
export type FormState<Field extends string> = {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<Field, string>>;
  formError?: string;
  /** הערכים שהוקלדו: React מאפס את הטופס אחרי Action, ובשגיאה הם חוזרים אליו */
  values?: Record<string, string>;
};

/** השגיאה הראשונה לכל שדה */
export function toFieldErrors<Field extends string>(
  error: z.ZodError,
): Partial<Record<Field, string>> {
  const result: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !result[field]) result[field] = issue.message;
  }
  return result as Partial<Record<Field, string>>;
}
