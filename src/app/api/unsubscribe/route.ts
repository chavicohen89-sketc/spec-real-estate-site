import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeTokenSchema } from "@/lib/validation/unsubscribe";
import { unsubscribe } from "@/server/subscribers";

/** הסרה בלחיצה אחת מתוכנת הדואר (RFC 8058). מקבל POST בלבד, כדי שסורקי קישורים לא יסירו */
export async function POST(request: NextRequest) {
  const token = unsubscribeTokenSchema.safeParse(request.nextUrl.searchParams.get("token"));
  if (!token.success) return new NextResponse(null, { status: 400 });

  try {
    const result = await unsubscribe(token.data);
    return new NextResponse(null, { status: result === "ok" ? 200 : 404 });
  } catch (error) {
    console.error("one-click unsubscribe failed", error);
    return new NextResponse(null, { status: 500 });
  }
}
