import { z } from "zod";
import { parsePage } from "@/lib/pagination";

export type SubscribersFilter = {
  q: string;
  /** "all", "general" או מזהה פרויקט */
  project: string;
  status: "all" | "active" | "unsubscribed";
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const MAX_QUERY = 100;
const uuid = z.uuid();
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** קריאת הסינון מה-URL. ערך לא תקין נחשב כאילו לא נבחר סינון */
export function parseSubscribersFilter(params: RawParams): SubscribersFilter {
  const project = first(params.project);
  const status = first(params.status);
  return {
    q: (first(params.q) ?? "").trim().slice(0, MAX_QUERY),
    project: project === "general" || uuid.safeParse(project).success ? project! : "all",
    status: status === "active" || status === "unsubscribed" ? status : "all",
    page: parsePage(first(params.page)),
  };
}

/** הסינון כ-query string, בלי ערכי ברירת מחדל ובלי העמוד אם הוא 1 */
export function subscribersFilterQuery(filter: SubscribersFilter, page = filter.page): string {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.project !== "all") params.set("project", filter.project);
  if (filter.status !== "all") params.set("status", filter.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, "\\$&")}%`;
const quoted = (text: string) => `"${text.replace(/[\\"]/g, "\\$&")}"`;

/** הספרות שאפשר לחפש בעמודת הטלפון (+9725…), או null אם החיפוש אינו מספר */
function phoneDigits(q: string): string | null {
  if (!/^[\d\s()+-]+$/.test(q)) return null;
  const digits = q.replace(/\D/g, "").replace(/^(?:972|0)/, "");
  return digits || null;
}

/** תנאי החיפוש ב-PostgREST. הערכים בגרשיים, כדי שפסיק או סוגריים לא ישברו את התנאי */
export function subscribersSearchClause(q: string): string {
  const term = quoted(likePattern(q));
  const clauses = [`full_name.ilike.${term}`, `email.ilike.${term}`];
  const digits = phoneDigits(q);
  if (digits) clauses.push(`phone.ilike.${quoted(likePattern(digits))}`);
  return clauses.join(",");
}
