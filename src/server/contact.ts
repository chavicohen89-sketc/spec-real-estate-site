import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactInput } from "@/lib/validation/contact";
import { sendContactNotification } from "./email";
import { consumeRateLimit } from "./rate-limit";

export type ContactResult = "ok" | "rate_limited";

export async function saveContactMessage(
  input: ContactInput,
  ip: string | null,
): Promise<ContactResult> {
  if (!(await consumeRateLimit("contact", ip))) return "rate_limited";

  const { data, error } = await createAdminClient()
    .from("contact_messages")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      message: input.message,
      source_ip: ip,
    })
    .select("id")
    .single();
  if (error) throw error;

  await sendContactNotification(data.id);
  return "ok";
}
