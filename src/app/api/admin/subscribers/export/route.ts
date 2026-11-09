import type { NextRequest } from "next/server";
import { formatFileDate } from "@/lib/dates";
import { parseSubscribersFilter } from "@/lib/validation/subscribers-filter";
import { getAdminState } from "@/server/auth";
import { exportSubscribersCsv } from "@/server/subscribers-admin";

export async function GET(request: NextRequest) {
  const state = await getAdminState();
  if (state.status !== "admin") {
    return new Response(null, { status: state.status === "anonymous" ? 401 : 403 });
  }

  const filter = parseSubscribersFilter(Object.fromEntries(request.nextUrl.searchParams));
  const csv = await exportSubscribersCsv(state.supabase, filter);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${formatFileDate(new Date())}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
