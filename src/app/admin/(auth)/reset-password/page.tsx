import { ResetPasswordForm } from "@/components/admin/AuthForms";
import { strings } from "@/lib/strings";

// proxy מפנה מי שלא הגיע לכאן עם סשן מהקישור במייל
export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl">{strings.admin.auth.resetTitle}</h1>
      <ResetPasswordForm />
    </>
  );
}
