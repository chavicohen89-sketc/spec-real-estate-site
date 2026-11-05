import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * לקוח Supabase לצד שרת (Server Components, Server Actions, Route Handlers),
 * עם עוגיות המשתמש. פועל בהרשאות המשתמש המחובר, כלומר כפוף ל-RLS.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // נקרא מתוך Server Component, שבו אי אפשר לכתוב עוגיות.
          // רענון הטוקן יקרה ב-proxy (שלב 5).
        }
      },
    },
  });
}
