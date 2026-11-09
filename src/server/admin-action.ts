import "server-only";
import { strings } from "@/lib/strings";
import { NotAdminError, requireAdmin, type AdminDb } from "@/server/auth";

const common = strings.admin.common;

export type ActionFailure = { ok: false; error: string };

export const failure = (error: string = common.genericError): ActionFailure => ({
  ok: false,
  error,
});

/** כל Action של הניהול עובר כאן: בדיקת is_admin, ותרגום שגיאות להודעה בעברית */
export async function asAdmin<R>(run: (db: AdminDb) => Promise<R>): Promise<R | ActionFailure> {
  try {
    return await run(await requireAdmin());
  } catch (error) {
    if (error instanceof NotAdminError) return failure(common.noPermission);
    console.error("admin action failed", error);
    return failure();
  }
}
