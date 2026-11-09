"use server";

import { refresh } from "next/cache";
import { idSchema, messageHandledSchema } from "@/lib/validation/admin";
import { asAdmin, failure, type ActionFailure } from "@/server/admin-action";
import { setMessageHandled } from "@/server/messages";

export async function setMessageHandledAction(
  rawId: string,
  rawHandled: boolean,
): Promise<{ ok: true } | ActionFailure> {
  return asAdmin(async (db) => {
    const id = idSchema.safeParse(rawId);
    const handled = messageHandledSchema.safeParse(rawHandled);
    if (!id.success || !handled.success) return failure();
    if (!(await setMessageHandled(db, id.data, handled.data))) return failure();
    refresh(); // מעדכן גם את המונה בתפריט
    return { ok: true as const };
  });
}
