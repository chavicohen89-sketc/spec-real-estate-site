import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type AdminDb = Awaited<ReturnType<typeof createClient>>;

type AdminState =
  | { status: "anonymous" }
  | { status: "forbidden"; email: string }
  | { status: "admin"; email: string; userId: string; supabase: AdminDb };

/**
 * מי המשתמש הנוכחי. getUser מאמת מול Supabase, ולא סומך על העוגייה לבדה.
 * cache: בתוך בקשה אחת הבדיקה רצה פעם אחת, גם אם ה-layout והעמוד קוראים לה.
 */
export const getAdminState = cache(async (): Promise<AdminState> => {
  await connection(); // תמיד בזמן הבקשה: אף פעם לא מחשבים הרשאה ב-prerender
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error) throw new Error(`is_admin: ${error.message}`);
  if (!isAdmin) return { status: "forbidden", email: user.email ?? "" };

  return { status: "admin", email: user.email ?? "", userId: user.id, supabase };
});

export class NotAdminError extends Error {}

/** לכל Server Action של הניהול: זורק אם המשתמש אינו מנהל */
export async function requireAdmin(): Promise<AdminDb> {
  const state = await getAdminState();
  if (state.status !== "admin") throw new NotAdminError();
  return state.supabase;
}

/** מזהה וכתובת של המנהל המחובר */
export async function requireAdminUser(): Promise<{ userId: string; email: string }> {
  const state = await getAdminState();
  if (state.status !== "admin") throw new NotAdminError();
  return { userId: state.userId, email: state.email };
}

/** לכל עמוד של הניהול: מפנה מי שאינו מנהל */
export async function requireAdminPage(): Promise<AdminDb> {
  const state = await getAdminState();
  if (state.status !== "admin") redirect("/admin/login");
  return state.supabase;
}
