"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/site-url";
import { strings } from "@/lib/strings";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  newPasswordSchema,
  type ForgotPasswordField,
  type LoginField,
  type NewPasswordField,
} from "@/lib/validation/admin";
import { toFieldErrors, type FormState } from "@/lib/validation/form-state";

const t = strings.admin.auth.errors;

export async function loginAction(
  _prev: FormState<LoginField>,
  formData: FormData,
): Promise<FormState<LoginField>> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error), values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", formError: t.invalidCredentials, values: { email } };
  }
  redirect("/admin/projects");
}

export async function forgotPasswordAction(
  _prev: FormState<ForgotPasswordField>,
  formData: FormData,
): Promise<FormState<ForgotPasswordField>> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl()}/admin/auth/callback`,
  });
  // תמיד "הצלחה": לא חושפים אילו כתובות רשומות
  if (error) console.error("resetPasswordForEmail failed", error.code);
  return { status: "success" };
}

export async function updatePasswordAction(
  _prev: FormState<NewPasswordField>,
  formData: FormData,
): Promise<FormState<NewPasswordField>> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("updateUser failed", error.code);
    return { status: "error", formError: t.generic };
  }
  redirect("/admin/projects");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
