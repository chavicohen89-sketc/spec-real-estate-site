import "server-only";
import { buildCsv } from "@/lib/csv";
import { formatDateTime } from "@/lib/dates";
import { pageRange, RANGE_NOT_SATISFIABLE } from "@/lib/pagination";
import { formatLocalPhone } from "@/lib/phone";
import { strings } from "@/lib/strings";
import {
  subscribersSearchClause,
  type SubscribersFilter,
} from "@/lib/validation/subscribers-filter";
import type { AdminDb } from "@/server/auth";

const t = strings.admin.subscribers;

/**
 * subscriptions: כל ההרשמות, לעמודה "למה רשום".
 * match: עותק שעליו מסננים, כדי שסינון לפי פרויקט לא יסתיר את שאר ההרשמות של האדם.
 */
const SELECT =
  "id, full_name, email, phone, email_consent_at, whatsapp_consent_at, unsubscribed_at, subscriptions(project_id, projects(title)), match:subscriptions(project_id)";

export type AdminSubscriber = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  lists: string[];
  whatsapp: boolean;
  consentAt: string;
  active: boolean;
};

function query(db: AdminDb, filter: SubscribersFilter) {
  let builder = db
    .from("subscribers")
    .select(SELECT, { count: "exact" })
    .order("email_consent_at", { ascending: false })
    .order("id", { ascending: true });

  if (filter.q) builder = builder.or(subscribersSearchClause(filter.q));
  if (filter.status === "active") builder = builder.is("unsubscribed_at", null);
  if (filter.status === "unsubscribed") builder = builder.not("unsubscribed_at", "is", null);

  if (filter.project === "general") {
    builder = builder.is("match.project_id", null).not("match", "is", null);
  } else if (filter.project !== "all") {
    builder = builder.eq("match.project_id", filter.project).not("match", "is", null);
  }
  return builder;
}

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  email_consent_at: string;
  whatsapp_consent_at: string | null;
  unsubscribed_at: string | null;
  subscriptions: { project_id: string | null; projects: { title: string } | null }[];
};

function toSubscriber(row: Row): AdminSubscriber {
  const projects = row.subscriptions.flatMap((s) => (s.projects ? [s.projects.title] : []));
  const general = row.subscriptions.some((s) => s.project_id === null);
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    lists: [...(general ? [t.general] : []), ...projects.sort((a, b) => a.localeCompare(b, "he"))],
    whatsapp: row.whatsapp_consent_at !== null,
    consentAt: row.email_consent_at,
    active: row.unsubscribed_at === null,
  };
}

export async function listSubscribers(
  db: AdminDb,
  filter: SubscribersFilter,
): Promise<{ rows: AdminSubscriber[]; total: number; page: number }> {
  const [from, to] = pageRange(filter.page);
  const { data, count, error } = await query(db, filter).range(from, to);

  // עמוד שמעבר לסוף הרשימה, למשל אחרי שינוי בנתונים: חוזרים לעמוד הראשון
  if (error?.code === RANGE_NOT_SATISFIABLE && filter.page > 1) {
    return listSubscribers(db, { ...filter, page: 1 });
  }
  if (error) throw new Error(`listSubscribers: ${error.message}`);

  return { rows: data.map(toSubscriber), total: count ?? 0, page: filter.page };
}

const EXPORT_BATCH = 1000;

/** כל הנרשמים לפי הסינון הנוכחי, כקובץ CSV */
export async function exportSubscribersCsv(
  db: AdminDb,
  filter: SubscribersFilter,
): Promise<string> {
  const rows: AdminSubscriber[] = [];
  for (let from = 0; ; from += EXPORT_BATCH) {
    const { data, error } = await query(db, filter).range(from, from + EXPORT_BATCH - 1);
    if (error?.code === RANGE_NOT_SATISFIABLE) break;
    if (error) throw new Error(`exportSubscribersCsv: ${error.message}`);
    rows.push(...data.map(toSubscriber));
    if (data.length < EXPORT_BATCH) break;
  }

  const c = t.columns;
  return buildCsv(
    [c.name, c.email, c.phone, c.lists, c.whatsapp, c.date, c.status],
    rows.map((s) => [
      s.fullName,
      s.email,
      formatLocalPhone(s.phone),
      s.lists.join(", "),
      s.whatsapp ? t.yes : t.no,
      formatDateTime(s.consentAt),
      s.active ? t.active : t.unsubscribed,
    ]),
  );
}
