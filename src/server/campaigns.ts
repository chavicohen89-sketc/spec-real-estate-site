import "server-only";
import { pageRange, RANGE_NOT_SATISFIABLE } from "@/lib/pagination";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Audience } from "@/lib/validation/campaign";
import type { AdminDb } from "@/server/auth";

export type Recipient = { id: string; email: string; unsubscribeToken: string };

/** Supabase מחזיר עד 1000 שורות לבקשה, ולכן עוברים בדפים */
const PAGE_SIZE = 1000;

function audiencePage(audience: Audience, from: number, to: number) {
  const db = createAdminClient();
  if (audience.type === "all") {
    return db
      .from("subscribers")
      .select("id, email, unsubscribe_token")
      .is("unsubscribed_at", null)
      .not("email_consent_at", "is", null)
      .order("id")
      .range(from, to);
  }
  const query = db
    .from("subscribers")
    .select("id, email, unsubscribe_token, subscriptions!inner(project_id)")
    .is("unsubscribed_at", null)
    .not("email_consent_at", "is", null);
  const filtered =
    audience.type === "general"
      ? query.is("subscriptions.project_id", null)
      : query.eq("subscriptions.project_id", audience.projectId);
  return filtered.order("id").range(from, to);
}

/** נמענים פעילים עם הסכמה למייל. כל נרשם מופיע פעם אחת, גם אם יש לו כמה הרשמות */
export async function fetchAudience(audience: Audience): Promise<Recipient[]> {
  const recipients = new Map<string, Recipient>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await audiencePage(audience, from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`fetchAudience: ${error.message}`);
    for (const row of data) {
      recipients.set(row.id, { id: row.id, email: row.email, unsubscribeToken: row.unsubscribe_token });
    }
    if (data.length < PAGE_SIZE) return [...recipients.values()];
  }
}

export type LaunchProject = {
  id: string;
  title: string;
  slug: string;
  body: unknown;
  coverImagePath: string | null;
};

/**
 * תופס את מייל הפרויקט. UPDATE אחד אטומי: גם שתי לחיצות במקביל יקבלו שורה רק פעם אחת.
 * מחזיר null אם המנהל לא אישר מייל, או שהמייל כבר נתפס.
 */
export async function claimProjectLaunch(projectId: string): Promise<LaunchProject | null> {
  const { data, error } = await createAdminClient()
    .from("projects")
    .update({ launch_email_sent_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("status", "published")
    .eq("launch_email_requested", true)
    .is("launch_email_sent_at", null)
    .select("id, title, slug, body, cover_image_path")
    .maybeSingle();
  if (error) throw new Error(`claimProjectLaunch: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    coverImagePath: data.cover_image_path,
  };
}

export type CampaignRow = {
  id: string;
  date: string;
  subject: string;
  type: string;
  audience: string;
  projectTitle: string | null;
  recipientsCount: number;
};

export async function listCampaigns(
  db: AdminDb,
  page: number,
): Promise<{ rows: CampaignRow[]; total: number; page: number }> {
  const [from, to] = pageRange(page);
  const { data, count, error } = await db
    .from("campaigns")
    .select("id, created_at, sent_at, subject, type, audience, recipients_count, projects(title)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error?.code === RANGE_NOT_SATISFIABLE && page > 1) return listCampaigns(db, 1);
  if (error) throw new Error(`listCampaigns: ${error.message}`);

  return {
    rows: data.map((c) => ({
      id: c.id,
      date: c.sent_at ?? c.created_at,
      subject: c.subject,
      type: c.type,
      audience: c.audience,
      projectTitle: c.projects?.title ?? null,
      recipientsCount: c.recipients_count,
    })),
    total: count ?? 0,
    page,
  };
}
