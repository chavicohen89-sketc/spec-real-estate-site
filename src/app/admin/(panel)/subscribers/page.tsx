import Form from "next/form";
import Link from "next/link";
import { Pagination } from "@/components/admin/Pagination";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { formatDateTime } from "@/lib/dates";
import { pageCount } from "@/lib/pagination";
import { formatLocalPhone } from "@/lib/phone";
import { strings } from "@/lib/strings";
import {
  parseSubscribersFilter,
  subscribersFilterQuery,
} from "@/lib/validation/subscribers-filter";
import { requireAdminPage } from "@/server/auth";
import { listProjects } from "@/server/projects";
import { listSubscribers } from "@/server/subscribers-admin";

const t = strings.admin.subscribers;
const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm";
const PATH = "/admin/subscribers";

export default async function AdminSubscribersPage({
  searchParams,
}: PageProps<"/admin/subscribers">) {
  const db = await requireAdminPage();
  const requested = parseSubscribersFilter(await searchParams);
  const [{ rows, total, page }, projects] = await Promise.all([
    listSubscribers(db, requested),
    listProjects(db),
  ]);
  const filter = { ...requested, page };
  const exportQuery = subscribersFilterQuery(filter, 1);
  const c = t.columns;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl">{t.title}</h1>
          <span className="text-sm text-muted-foreground">{t.total(total)}</span>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/admin/subscribers/export${exportQuery}`} download>
            {t.export}
          </a>
        </Button>
      </div>

      {/* key: אחרי ניקוי הסינון השדות חוזרים לערכים מה-URL */}
      <Form
        key={exportQuery}
        action={PATH}
        className="mb-6 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="filter-q">{t.search}</Label>
          <Input id="filter-q" name="q" type="search" defaultValue={filter.q} placeholder={t.searchPlaceholder} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-project">{t.project}</Label>
          <select id="filter-project" name="project" defaultValue={filter.project} className={SELECT_CLASS}>
            <option value="all">{t.allProjects}</option>
            <option value="general">{t.general}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-status">{t.status}</Label>
          <select id="filter-status" name="status" defaultValue={filter.status} className={SELECT_CLASS}>
            <option value="all">{t.allStatuses}</option>
            <option value="active">{t.active}</option>
            <option value="unsubscribed">{t.unsubscribed}</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{t.apply}</Button>
          {exportQuery && (
            <Button asChild variant="ghost">
              <Link href={PATH}>{t.clear}</Link>
            </Button>
          )}
        </div>
      </Form>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t.title}>
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b text-start text-muted-foreground">
                {[c.name, c.email, c.phone, c.lists, c.whatsapp, c.date, c.status].map((label) => (
                  <th key={label} scope="col" className="px-2 py-2 text-start font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b align-top">
                  <td className="px-2 py-3">{s.fullName}</td>
                  <td className="px-2 py-3">
                    <span dir="ltr">{s.email}</span>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span dir="ltr">{formatLocalPhone(s.phone)}</span>
                  </td>
                  <td className="px-2 py-3">{s.lists.join(", ")}</td>
                  <td className="px-2 py-3">{s.whatsapp ? t.yes : t.no}</td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <span dir="ltr">{formatDateTime(s.consentAt)}</span>
                  </td>
                  <td className="px-2 py-3">
                    <Badge variant={s.active ? "default" : "outline"}>
                      {s.active ? t.active : t.unsubscribed}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={pageCount(total)}
        hrefFor={(target) => `${PATH}${subscribersFilterQuery(filter, target)}`}
      />
    </>
  );
}
