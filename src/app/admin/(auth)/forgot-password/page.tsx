import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/AuthForms";
import { strings } from "@/lib/strings";

const t = strings.admin.auth;

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-3 text-2xl">{t.forgotTitle}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t.forgotLead}</p>
      <ForgotPasswordForm />
      <Link href="/admin/login" className="mt-5 text-sm text-muted-foreground underline">
        {t.backToLogin}
      </Link>
    </>
  );
}
