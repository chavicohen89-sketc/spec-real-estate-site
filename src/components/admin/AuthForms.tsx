"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  loginAction,
  updatePasswordAction,
} from "@/app/admin/(auth)/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { strings } from "@/lib/strings";
import type {
  ForgotPasswordField,
  LoginField,
  NewPasswordField,
} from "@/lib/validation/admin";
import type { FormState } from "@/lib/validation/form-state";

const t = strings.admin.auth;

type FieldProps = {
  label: string;
  name: string;
  type: "email" | "password";
  autoComplete: string;
  error?: string;
  defaultValue?: string;
};

function Field({ label, name, type, autoComplete, error, defaultValue }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        dir="ltr"
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

const FormMessage = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="text-sm">
      {message}
    </p>
  ) : null;

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState<LoginField>, FormData>(loginAction, {
    status: "idle",
  });
  return (
    <form action={action} noValidate className="grid gap-5">
      <Field
        label={t.email}
        name="email"
        type="email"
        autoComplete="username"
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
      />
      <Field
        label={t.password}
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />
      <FormMessage message={state.formError} />
      <Button type="submit" disabled={pending}>
        {pending ? t.loggingIn : t.login}
      </Button>
      <Link href="/admin/forgot-password" className="text-sm text-muted-foreground underline">
        {t.forgotLink}
      </Link>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<FormState<ForgotPasswordField>, FormData>(
    forgotPasswordAction,
    { status: "idle" },
  );
  if (state.status === "success") {
    return <p role="status">{t.forgotSuccess}</p>;
  }
  return (
    <form action={action} noValidate className="grid gap-5">
      <Field
        label={t.email}
        name="email"
        type="email"
        autoComplete="username"
        error={state.fieldErrors?.email}
      />
      <Button type="submit" disabled={pending}>
        {pending ? t.forgotSending : t.forgotSubmit}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<FormState<NewPasswordField>, FormData>(
    updatePasswordAction,
    { status: "idle" },
  );
  return (
    <form action={action} noValidate className="grid gap-5">
      <Field
        label={t.newPassword}
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
      />
      <Field
        label={t.confirmPassword}
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirm}
      />
      <FormMessage message={state.formError} />
      <Button type="submit" disabled={pending}>
        {pending ? t.resetSaving : t.resetSubmit}
      </Button>
    </form>
  );
}
