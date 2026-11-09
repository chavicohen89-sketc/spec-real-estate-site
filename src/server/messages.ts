import "server-only";
import { pageRange, RANGE_NOT_SATISFIABLE } from "@/lib/pagination";
import type { AdminDb } from "@/server/auth";

export type AdminMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

export async function listMessages(
  db: AdminDb,
  page: number,
): Promise<{ rows: AdminMessage[]; total: number; page: number }> {
  const [from, to] = pageRange(page);
  const { data, count, error } = await db
    .from("contact_messages")
    .select("id, full_name, email, phone, message, handled, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (error?.code === RANGE_NOT_SATISFIABLE && page > 1) return listMessages(db, 1);
  if (error) throw new Error(`listMessages: ${error.message}`);

  return {
    rows: data.map((m) => ({
      id: m.id,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      message: m.message,
      handled: m.handled,
      createdAt: m.created_at,
    })),
    total: count ?? 0,
    page,
  };
}

export async function countUnhandledMessages(db: AdminDb): Promise<number> {
  const { count, error } = await db
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("handled", false);
  if (error) throw new Error(`countUnhandledMessages: ${error.message}`);
  return count ?? 0;
}

export async function setMessageHandled(
  db: AdminDb,
  id: string,
  handled: boolean,
): Promise<boolean> {
  const { data, error } = await db
    .from("contact_messages")
    .update({ handled })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`setMessageHandled: ${error.message}`);
  return data.length === 1;
}
