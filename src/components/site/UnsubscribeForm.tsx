"use client";

import { useActionState } from "react";
import { unsubscribeAction } from "@/app/(site)/actions";
import { strings } from "@/lib/strings";
import type { FormState } from "@/lib/validation/form-state";
import { Button } from "./Button";
import { FieldError, FormSuccess } from "./FormField";

const initialState: FormState<never> = { status: "idle" };

/** ההסרה קורית רק בלחיצה: סורקי קישורים של מערכות מייל פותחים את הקישור ב-GET */
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, action, isPending] = useActionState(unsubscribeAction, initialState);
  const t = strings.unsubscribe;

  if (state.status === "success") {
    return <FormSuccess title={t.successTitle} body={t.successBody} />;
  }

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? t.submitting : t.submit}
      </Button>
      <div role="alert">
        <FieldError id="unsubscribe-form-error" message={state.formError} />
      </div>
    </form>
  );
}
