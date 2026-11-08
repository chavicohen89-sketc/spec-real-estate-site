"use client";

import { useActionState } from "react";
import { subscribeAction } from "@/app/(site)/actions";
import { strings } from "@/lib/strings";
import type { FormState } from "@/lib/validation/form-state";
import type { SubscribeField } from "@/lib/validation/subscribe";
import { Button } from "./Button";
import { CheckboxField, FieldError, FormField, FormSuccess, HoneypotField } from "./FormField";

const initialState: FormState<SubscribeField> = { status: "idle" };

/** טופס הרשמה לעדכונים. עם projectId: הרשמה לפרויקט; בלי: הרשמה כללית */
export function SubscribeForm({ projectId }: { projectId?: string }) {
  const [state, action, isPending] = useActionState(subscribeAction, initialState);
  const t = strings.forms;

  if (state.status === "success") {
    return (
      <div className="mt-10">
        <FormSuccess title={t.subscribe.successTitle} body={t.subscribe.successBody} />
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  // noValidate: הודעות השגיאה בעברית מגיעות מהשרת, ולא מבועות הדפדפן
  return (
    <form action={action} noValidate className="relative mt-10 space-y-7">
      {projectId && <input type="hidden" name="projectId" value={projectId} />}
      <HoneypotField label={t.honeypot} />
      <FormField
        label={t.fullName}
        name="fullName"
        autoComplete="name"
        required
        defaultValue={values.fullName}
        error={errors.fullName}
      />
      <FormField
        label={t.email}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values.email}
        error={errors.email}
      />
      <FormField
        label={t.phone}
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        defaultValue={values.phone}
        error={errors.phone}
      />
      <div className="space-y-3">
        <CheckboxField
          label={t.subscribe.emailConsent}
          name="emailConsent"
          defaultChecked={values.emailConsent === "on"}
          error={errors.emailConsent}
        />
        <CheckboxField
          label={t.subscribe.whatsappConsent}
          name="whatsappConsent"
          defaultChecked={values.whatsappConsent === "on"}
        />
      </div>
      <div role="alert">
        <FieldError id="subscribe-form-error" message={state.formError} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? t.subscribe.submitting : t.subscribe.submit}
      </Button>
    </form>
  );
}
