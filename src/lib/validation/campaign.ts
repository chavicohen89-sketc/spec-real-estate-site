import { z } from "zod";
import { richTextPlainText } from "@/lib/rich-text";
import { strings } from "@/lib/strings";
import { richTextDoc } from "./admin";

const t = strings.admin.email.errors;

export const audienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({ type: z.literal("general") }),
  z.object({ type: z.literal("project"), projectId: z.uuid() }),
]);
export type Audience = z.infer<typeof audienceSchema>;

export const campaignContentSchema = z.object({
  subject: z.string().trim().min(1, t.subject).max(200, t.subjectTooLong),
  body: richTextDoc.refine((doc) => richTextPlainText(doc) !== "", t.body),
});

export const campaignSchema = campaignContentSchema.extend({ audience: audienceSchema });
export type CampaignInput = z.infer<typeof campaignSchema>;
