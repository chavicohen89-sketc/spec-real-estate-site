import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * לקוח ציבורי לצד שרת: המפתח הציבורי, בלי עוגיות ובלי משתמש.
 * משמש לשליפות של האתר הציבורי בתוך "use cache", שבו אסור לקרוא עוגיות.
 * כפוף ל-RLS כמו כל מבקר אנונימי, כך שטיוטות לא יכולות לחזור ממנו.
 */
export function createPublicClient() {
  return createClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
