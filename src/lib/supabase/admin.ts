import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { supabaseUrl } from "./env";

/**
 * לקוח service role: עוקף RLS. צד שרת בלבד.
 * משמש רק בתוך src/server/ (הרשמה, צור קשר, דיוור) ובסקריפטים.
 * לעולם לא לייבא מקומפוננטת לקוח; "server-only" ישבור את ה-build אם זה יקרה.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing env var SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
