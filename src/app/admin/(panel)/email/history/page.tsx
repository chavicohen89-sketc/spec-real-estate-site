import { Pagination } from "@/components/admin/Pagination";
import { formatDateTime } from "@/lib/dates";
import { pageCount, parsePage } from "@/lib/pagination";
import { strings } from "@/lib/strings";
import { requireAdminPage } from "@/server/auth";
import { listCampaigns, type CampaignRow } from "@/server/campaigns";

const t = strings.admin.emailHistory;
const CELL = "px-3 py-3 text-start align-top";
const PATH = "/admin/email/history";

function audienceLabel(row: CampaignRow): string {
  if (row.audience === "all") return t.audienceAll;
  if (row.audience === "general") return t.audienceGeneral;
  return t.audienceProject(row.projectTitle);
}

export default async function AdminEmailHistoryPage({
  searchParams,
}: PageProps<"/admin/email/history">) {
  const db = await requireAdminPage();
  const { page: rawPage } = await searchParams;
  const { rows, total, page } = await listCampaigns(
    db,
    parsePage(Array.isArray(rawPage) ? rawPage[0] : rawPage),
  );
  const c = t.columns;

  return (
    <>
      <h1 className="mb-6 text-2xl">{t.title}</h1>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-t text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className={`${CELL} font-normal`}>{c.date}</th>
                <th className={`${CELL} font-normal`}>{c.subject}</th>
                <th className={`${CELL} font-normal`}>{c.audience}</th>
                <th className={`${CELL} font-normal`}>{c.count}</th>
                <th className={`${CELL} font-normal`}>{c.type}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b">
                  <td dir="ltr" className={`${CELL} whitespace-nowrap`}>
                    {formatDateTime(row.date)}
                  </td>
                  <td className={`${CELL} break-words`}>{row.subject}</td>
                  <td className={CELL}>{audienceLabel(row)}</td>
                  <td className={CELL}>{row.recipientsCount}</td>
                  <td className={CELL}>{row.type === "auto" ? t.typeAuto : t.typeManual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={pageCount(total)}
        hrefFor={(target) => (target > 1 ? `${PATH}?page=${target}` : PATH)}
      />
    </>
  );
}
