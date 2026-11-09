import "server-only";
import { createElement, type ReactElement } from "react";
import { render, toPlainText } from "react-email";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import Campaign from "@/emails/Campaign";
import ProjectLaunch from "@/emails/ProjectLaunch";
import Welcome from "@/emails/Welcome";
import type { Json } from "@/lib/database.types";
import { richTextExcerpt } from "@/lib/rich-text";
import { siteUrl } from "@/lib/site-url";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Audience } from "@/lib/validation/campaign";
import { claimProjectLaunch, fetchAudience, type Recipient } from "./campaigns";

// המקום היחיד שמדבר עם Resend. ב-log רק מזהים, בלי פרטים אישיים.

const BATCH_SIZE = 100;
const PENDING_CHUNK = 1000;
const BATCH_PAUSE_MS = 600; // Resend מגביל ל-2 בקשות בשנייה
const UNIQUE_VIOLATION = "23505";
const TOKEN_PLACEHOLDER = "__UNSUBSCRIBE_TOKEN__";

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing env var RESEND_API_KEY");
  return new Resend(key);
}

function sender(): string {
  const address = process.env.EMAIL_FROM;
  if (!address) throw new Error("Missing env var EMAIL_FROM");
  return `${siteConfig.name} <${address}>`;
}

const unsubscribePageUrl = (token: string) => `${siteUrl()}/unsubscribe?token=${token}`;

/** בלי ה-headers האלה ג'ימייל לא מציג כפתור הסרה ליד שם השולח */
function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${siteUrl()}/api/unsubscribe?token=${token}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

async function toHtmlAndText(element: ReactElement): Promise<{ html: string; text: string }> {
  const html = await render(element);
  return { html, text: toPlainText(html) };
}

const errorName = (error: unknown) => (error instanceof Error ? error.name : "unknown");

// ברוכים הבאים --------------------------------------------------------------

/** רץ אחרי התגובה לטופס, ולכן לא זורק: כישלון נרשם ב-log בלבד */
export async function sendWelcomeEmail(subscriberId: string, projectId?: string): Promise<void> {
  try {
    const db = createAdminClient();
    const { data: subscriber, error } = await db
      .from("subscribers")
      .select("email, full_name, unsubscribe_token, unsubscribed_at")
      .eq("id", subscriberId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!subscriber || subscriber.unsubscribed_at) return;

    let project: { title: string; slug: string } | null = null;
    if (projectId) {
      const { data, error: projectError } = await db
        .from("projects")
        .select("title, slug")
        .eq("id", projectId)
        .maybeSingle();
      if (projectError) throw new Error(projectError.message);
      project = data;
    }

    const token = subscriber.unsubscribe_token;
    const content = await toHtmlAndText(
      createElement(Welcome, {
        fullName: subscriber.full_name,
        unsubscribeUrl: unsubscribePageUrl(token),
        ctaUrl: project ? `${siteUrl()}/projects/${project.slug}` : siteUrl(),
        projectTitle: project?.title,
      }),
    );

    const { error: sendError } = await client().emails.send({
      from: sender(),
      to: subscriber.email,
      subject: strings.email.welcome.subject(siteConfig.name),
      ...content,
      headers: unsubscribeHeaders(token),
    });
    if (sendError) throw new Error(sendError.name);
    console.info("[email] welcome sent", { subscriberId });
  } catch (error) {
    console.error("[email] welcome failed", { subscriberId, error: errorName(error) });
  }
}

export async function sendContactNotification(messageId: string) {
  console.info("[email] contact notification (stub)", { messageId });
}

// שליחה לקהל ------------------------------------------------------------------

export type AudienceContent = {
  campaignId?: string;
  type: "manual" | "auto";
  subject: string;
  body: Json | null;
  projectId?: string | null;
  sentBy: string | null;
  /** התבנית. מקבלת קישור הסרה, שמוחלף לכל נמען */
  email: (unsubscribeUrl: string) => ReactElement;
};

export type SendResult =
  | { status: "duplicate" }
  | { status: "no_recipients" }
  | { status: "done"; sent: number; failed: number };

type Delivery = { status: "sent" | "failed"; resend_id: string | null; error: string | null };

async function deliverBatch(
  resend: Resend,
  batch: Recipient[],
  subject: string,
  html: string,
  text: string,
  idempotencyKey: string,
): Promise<Delivery[]> {
  try {
    const { data, error } = await resend.batch.send(
      batch.map((recipient) => ({
        from: sender(),
        to: recipient.email,
        subject,
        html: html.replaceAll(TOKEN_PLACEHOLDER, recipient.unsubscribeToken),
        text: text.replaceAll(TOKEN_PLACEHOLDER, recipient.unsubscribeToken),
        headers: unsubscribeHeaders(recipient.unsubscribeToken),
      })),
      { idempotencyKey },
    );
    if (error || !data) throw new Error(error?.message ?? "empty batch response");
    return batch.map((_, i) => ({ status: "sent", resend_id: data.data[i]?.id ?? null, error: null }));
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "unknown";
    return batch.map(() => ({ status: "failed", resend_id: null, error: message }));
  }
}

/**
 * שולחת לקהל: נמענים ייחודיים, שורת קמפיין, ומנות של 100.
 * מנה שנכשלת לא עוצרת את הבאות, והכישלון נרשם לכל נמען.
 */
export async function sendToAudience(
  audience: Audience,
  content: AudienceContent,
): Promise<SendResult> {
  const recipients = await fetchAudience(audience);
  if (recipients.length === 0 && content.type === "manual") return { status: "no_recipients" };

  const db = createAdminClient();
  const { data: campaign, error: campaignError } = await db
    .from("campaigns")
    .insert({
      ...(content.campaignId ? { id: content.campaignId } : {}),
      type: content.type,
      subject: content.subject,
      body: content.body,
      audience: audience.type,
      project_id: audience.type === "project" ? audience.projectId : (content.projectId ?? null),
      sent_by: content.sentBy,
    })
    .select("id")
    .single();
  // אותו מזהה פעמיים: לחיצה כפולה על "שליחה"
  if (campaignError?.code === UNIQUE_VIOLATION) return { status: "duplicate" };
  if (campaignError) throw new Error(`sendToAudience: ${campaignError.message}`);
  const campaignId = campaign.id;

  const pending = recipients.map((r) => ({ campaign_id: campaignId, subscriber_id: r.id }));
  for (let i = 0; i < pending.length; i += PENDING_CHUNK) {
    const { error } = await db.from("campaign_recipients").insert(pending.slice(i, i + PENDING_CHUNK));
    if (error) throw new Error(`sendToAudience: ${error.message}`);
  }

  const resend = client();
  const { html, text } = await toHtmlAndText(content.email(unsubscribePageUrl(TOKEN_PLACEHOLDER)));

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const deliveries = await deliverBatch(resend, batch, content.subject, html, text, `${campaignId}-${i}`);

    sent += deliveries.filter((d) => d.status === "sent").length;
    failed += deliveries.filter((d) => d.status === "failed").length;

    const { error } = await db.from("campaign_recipients").upsert(
      batch.map((recipient, index) => ({
        campaign_id: campaignId,
        subscriber_id: recipient.id,
        ...deliveries[index],
      })),
      { onConflict: "campaign_id,subscriber_id" },
    );
    if (error) console.error("[email] recipient status update failed", { campaignId });
  }

  const { error: finishError } = await db
    .from("campaigns")
    .update({ recipients_count: sent, sent_at: new Date().toISOString() })
    .eq("id", campaignId);
  if (finishError) console.error("[email] campaign update failed", { campaignId });

  console.info("[email] campaign finished", { campaignId, sent, failed });
  return { status: "done", sent, failed };
}

// מייל פרויקט חדש ------------------------------------------------------------

/**
 * נשלח לנרשמים הכלליים, פעם אחת לכל פרויקט. התפיסה קודמת לשליחה,
 * ולכן כישלון בשליחה לא יגרום למייל חוזר בפרסום הבא.
 */
export async function sendProjectLaunchEmail(
  projectId: string,
  sentBy: string | null,
): Promise<"skipped" | "sent" | "failed"> {
  try {
    const project = await claimProjectLaunch(projectId);
    if (!project) return "skipped";

    const result = await sendToAudience(
      { type: "general" },
      {
        type: "auto",
        subject: strings.email.launch.subject(project.title),
        body: project.body as Json | null,
        projectId: project.id,
        sentBy,
        email: (unsubscribeUrl) =>
          createElement(ProjectLaunch, {
            title: project.title,
            excerpt: richTextExcerpt(project.body),
            coverUrl: project.coverImagePath ? imageUrl(project.coverImagePath) : null,
            projectUrl: `${siteUrl()}/projects/${project.slug}`,
            unsubscribeUrl,
          }),
      },
    );
    return result.status === "done" && result.failed > 0 ? "failed" : "sent";
  } catch (error) {
    console.error("[email] launch failed", { projectId, error: errorName(error) });
    return "failed";
  }
}

// דיוור ידני -----------------------------------------------------------------

function campaignEmail(subject: string, body: unknown, unsubscribeUrl: string): ReactElement {
  return createElement(Campaign, { subject, body, unsubscribeUrl });
}

/** אותה תבנית בדיוק כמו בשליחה האמיתית */
export async function renderCampaignPreview(subject: string, body: unknown): Promise<string> {
  return render(campaignEmail(subject, body, `${siteUrl()}/unsubscribe`));
}

export async function sendCampaignTest(to: string, subject: string, body: unknown): Promise<void> {
  const content = await toHtmlAndText(campaignEmail(subject, body, `${siteUrl()}/unsubscribe`));
  const { error } = await client().emails.send({
    from: sender(),
    to,
    subject: strings.admin.email.testSubject(subject),
    ...content,
  });
  if (error) throw new Error(`sendCampaignTest: ${error.name}`);
}

export function sendManualCampaign(
  campaignId: string,
  audience: Audience,
  subject: string,
  body: Json,
  sentBy: string,
): Promise<SendResult> {
  return sendToAudience(audience, {
    campaignId,
    type: "manual",
    subject,
    body,
    sentBy,
    email: (unsubscribeUrl) => campaignEmail(subject, body, unsubscribeUrl),
  });
}
