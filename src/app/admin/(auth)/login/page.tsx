import { LoginForm } from "@/components/admin/AuthForms";
import { strings } from "@/lib/strings";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl">{strings.admin.auth.loginTitle}</h1>
      <LoginForm />
    </>
  );
}
