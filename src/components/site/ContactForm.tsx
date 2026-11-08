"use client";

import { useActionState } from "react";
import { contactAction } from "@/app/(site)/actions";
import { strings } from "@/lib/strings";
import type { ContactField } from "@/lib/validation/contact";
import type { FormState } from "@/lib/validation/form-state";
import { Button } from "./Button";
import { FieldError, FormField, FormSuccess, HoneypotField } from "./FormField";

const initialState: FormState<ContactField> = { status: "idle" };

export function ContactForm() {
  const [state, action, isPending] = useActionState(contactAction, initialState);
  const t = strings.forms;

  if (state.status === "success") {
    return (
      <div className="mt-10">
        <FormSuccess title={t.contact.successTitle} body={t.contact.successBody} />
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form action={action} noValidate className="relative mt-10 space-y-7">
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
        label={t.phoneOptional}
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={values.phone}
        error={errors.phone}
      />
      <FormField
        label={t.message}
        name="message"
        multiline
        required
        defaultValue={values.message}
        error={errors.message}
      />
      <div role="alert">
        <FieldError id="contact-form-error" message={state.formError} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? t.contact.submitting : t.contact.submit}
      </Button>
    </form>
  );
}
