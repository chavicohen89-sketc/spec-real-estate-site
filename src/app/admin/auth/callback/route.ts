import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** הקישור ממייל שחזור הסיסמה: ממיר את הקוד לסשן ומעביר לבחירת סיסמה */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/admin/reset-password", request.url));
    }
    console.error("exchangeCodeForSession failed", error.code);
  }
  return NextResponse.redirect(new URL("/admin/link-expired", request.url));
}
