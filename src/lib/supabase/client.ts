import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * לקוח Supabase לדפדפן (קומפוננטות "use client"), עם המפתח הציבורי בלבד.
 * משמש למשל להעלאת תמונות ישירות ל-Storage בממשק הניהול (ההרשאה מגיעה מה-RLS).
 */
export function createClient() {
  // משתני NEXT_PUBLIC_ חייבים להופיע בשמם המלא כדי ש-Next יטמיע אותם בדפדפן
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
