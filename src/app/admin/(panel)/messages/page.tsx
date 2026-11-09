import { MessageHandledButton } from "@/components/admin/MessageHandledButton";
import { Pagination } from "@/components/admin/Pagination";
import { Badge } from "@/components/admin/ui/badge";
import { formatDateTime } from "@/lib/dates";
import { pageCount, parsePage } from "@/lib/pagination";
import { formatLocalPhone } from "@/lib/phone";
import { strings } from "@/lib/strings";
import { requireAdminPage } from "@/server/auth";
import { listMessages } from "@/server/messages";

const t = strings.admin.messages;

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const db = await requireAdminPage();
  const { page: rawPage } = await searchParams;
  const { rows, total, page } = await listMessages(
    db,
    parsePage(Array.isArray(rawPage) ? rawPage[0] : rawPage),
  );

  return (
    <>
      <h1 className="mb-6 text-2xl">{t.title}</h1>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="border-t">
          {rows.map((m) => (
            <li key={m.id} className="grid gap-3 border-b py-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium break-words">{m.fullName}</span>
                <Badge variant={m.handled ? "outline" : "default"}>
                  {m.handled ? t.statusHandled : t.statusNew}
                </Badge>
                <span dir="ltr" className="ms-auto text-sm text-muted-foreground">
                  {formatDateTime(m.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a dir="ltr" href={`mailto:${m.email}`} className="break-all underline">
                  {m.email}
                </a>
                {m.phone && (
                  <a dir="ltr" href={`tel:${m.phone}`} className="underline">
                    {formatLocalPhone(m.phone)}
                  </a>
                )}
              </div>
              <p className="break-words whitespace-pre-wrap">{m.message}</p>
              <div>
                <MessageHandledButton id={m.id} handled={m.handled} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={pageCount(total)}
        hrefFor={(target) => (target > 1 ? `/admin/messages?page=${target}` : "/admin/messages")}
      />
    </>
  );
}
