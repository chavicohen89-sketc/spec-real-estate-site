"use server";

import type { Json } from "@/lib/database.types";
import { strings } from "@/lib/strings";
import { idSchema } from "@/lib/validation/admin";
import { audienceSchema, campaignContentSchema, campaignSchema } from "@/lib/validation/campaign";
import { asAdmin, failure, type ActionFailure } from "@/server/admin-action";
import { requireAdminUser } from "@/server/auth";
import { fetchAudience } from "@/server/campaigns";
import { renderCampaignPreview, sendCampaignTest, sendManualCampaign } from "@/server/email";

const t = strings.admin.email;

export async function countAudienceAction(
  raw: unknown,
): Promise<{ ok: true; count: number } | ActionFailure> {
  return asAdmin(async () => {
    const audience = audienceSchema.safeParse(raw);
    if (!audience.success) return failure();
    return { ok: true as const, count: (await fetchAudience(audience.data)).length };
  });
}

export async function previewCampaignAction(
  raw: unknown,
): Promise<{ ok: true; html: string } | ActionFailure> {
  return asAdmin(async () => {
    const content = campaignContentSchema.safeParse(raw);
    if (!content.success) return failure(content.error.issues[0].message);
    return { ok: true as const, html: await renderCampaignPreview(content.data.subject, content.data.body) };
  });
}

export async function sendTestCampaignAction(
  raw: unknown,
): Promise<{ ok: true; email: string } | ActionFailure> {
  return asAdmin(async () => {
    const content = campaignContentSchema.safeParse(raw);
    if (!content.success) return failure(content.error.issues[0].message);
    const { email } = await requireAdminUser();
    try {
      await sendCampaignTest(email, content.data.subject, content.data.body);
    } catch (error) {
      console.error("test email failed", error);
      return failure(t.errors.testFailed);
    }
    return { ok: true as const, email };
  });
}

export async function sendCampaignAction(
  rawId: string,
  raw: unknown,
): Promise<{ ok: true; sent: number; failed: number } | ActionFailure> {
  return asAdmin(async () => {
    const id = idSchema.safeParse(rawId);
    const input = campaignSchema.safeParse(raw);
    if (!id.success) return failure();
    if (!input.success) return failure(input.error.issues[0].message);

    const { userId } = await requireAdminUser();
    const { subject, body, audience } = input.data;
    const result = await sendManualCampaign(id.data, audience, subject, body as Json, userId);

    if (result.status === "no_recipients") return failure(t.errors.noRecipients);
    if (result.status === "duplicate") return failure(t.errors.duplicate);
    if (result.sent === 0) return failure(t.errors.allFailed);
    return { ok: true as const, sent: result.sent, failed: result.failed };
  });
}
