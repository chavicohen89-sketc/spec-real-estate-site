import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** כתובות ניהול שפתוחות בלי התחברות */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/link-expired",
  "/admin/auth/callback",
];

/**
 * נוחות בלבד: מפנה לא-מחוברים להתחברות ומרענן את הטוקן בעוגיות.
 * האבטחה עצמה נמצאת ב-requireAdmin וב-RLS. רץ רק על /admin,
 * כדי לא לפגוע במטמון של האתר הציבורי.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.includes(pathname);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && (pathname === "/admin" || pathname === "/admin/login")) {
    return NextResponse.redirect(new URL("/admin/projects", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
