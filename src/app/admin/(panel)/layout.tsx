import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminShell";
import { strings } from "@/lib/strings";
import { getAdminState } from "@/server/auth";
import { countUnhandledMessages } from "@/server/messages";

async function AdminGate({ children }: { children: React.ReactNode }) {
  const state = await getAdminState();
  if (state.status === "anonymous") redirect("/admin/login");

  if (state.status === "forbidden") {
    return (
      <>
        <AdminHeader showNav={false} />
        <main className="mx-auto w-full max-w-5xl px-4 py-16">
          <h1 className="text-2xl">{strings.admin.noAccess.title}</h1>
          <p className="mt-3 text-muted-foreground">{strings.admin.noAccess.body}</p>
        </main>
      </>
    );
  }

  const unhandledMessages = await countUnhandledMessages(state.supabase);

  return (
    <>
      <AdminHeader showNav unhandledMessages={unhandledMessages} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">{strings.admin.common.loading}</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
