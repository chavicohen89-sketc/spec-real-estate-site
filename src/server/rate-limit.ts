import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PER_HOUR = 5;
const WINDOW_SECONDS = 60 * 60;

export type RateLimitedAction = "subscribe" | "contact";

/** סופר את השליחה, ומחזיר true אם היא עדיין בתוך המכסה לשעה */
export async function consumeRateLimit(
  action: RateLimitedAction,
  ip: string | null,
): Promise<boolean> {
  const { data, error } = await createAdminClient().rpc("check_rate_limit", {
    p_key: `${action}:${ip ?? "unknown"}`,
    p_limit: MAX_PER_HOUR,
    p_window_seconds: WINDOW_SECONDS,
  });
  if (error) throw error;
  return data;
}
