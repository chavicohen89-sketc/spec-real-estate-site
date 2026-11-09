import "server-only";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscribeInput } from "@/lib/validation/subscribe";
import { sendWelcomeEmail } from "./email";
import { consumeRateLimit } from "./rate-limit";

export type SubscribeResult = "ok" | "rate_limited" | "invalid_project";

export async function subscribe(
  input: SubscribeInput,
  ip: string | null,
): Promise<SubscribeResult> {
  if (!(await consumeRateLimit("subscribe", ip))) return "rate_limited";

  const { data, error } = await createAdminClient()
    .rpc("upsert_subscription", {
      p_full_name: input.fullName,
      p_email: input.email,
      p_phone: input.phone,
      p_whatsapp_consent: input.whatsappConsent,
      p_project_id: input.projectId,
      p_source_ip: ip ?? undefined,
    })
    .maybeSingle();

  if (error) throw error;
  if (!data) return "invalid_project";

  // מי שכבר רשום לאותו דבר לא מקבל שוב "ברוכים הבאים"
  if (data.is_new_subscription) {
    const subscriberId = data.subscriber_id;
    after(() => sendWelcomeEmail(subscriberId, input.projectId)); // הטופס לא מחכה ל-Resend
  }
  return "ok";
}

export type UnsubscribeResult = "ok" | "invalid_token";

/** הסרה לפי טוקן. הסרה חוזרת מצליחה, ושומרת את מועד ההסרה הראשון */
export async function unsubscribe(token: string): Promise<UnsubscribeResult> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .is("unsubscribed_at", null)
    .select("id");
  if (error) throw error;
  if (updated.length > 0) return "ok";

  const { data: existing, error: selectError } = await supabase
    .from("subscribers")
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (selectError) throw selectError;
  return existing ? "ok" : "invalid_token";
}
