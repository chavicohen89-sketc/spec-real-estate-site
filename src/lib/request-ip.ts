import "server-only";
import { headers } from "next/headers";

/** כתובת ה-IP של הגולש. ב-Vercel הפלטפורמה קובעת את x-forwarded-for, והלקוח לא יכול לזייף אותו */
export async function getRequestIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
