import Link from "next/link";
import { strings } from "@/lib/strings";

const t = strings.admin.auth;

export default function LinkExpiredPage() {
  return (
    <>
      <h1 className="mb-3 text-2xl">{t.linkExpiredTitle}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t.linkExpiredBody}</p>
      <Link href="/admin/forgot-password" className="text-sm underline">
        {t.linkExpiredAction}
      </Link>
    </>
  );
}
