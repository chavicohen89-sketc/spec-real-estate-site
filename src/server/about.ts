import "server-only";
import type { Json } from "@/lib/database.types";
import { IMAGES_BUCKET } from "@/lib/storage";
import type { AdminDb } from "@/server/auth";

const KEY = "about";

export type AdminAbout = { body: Json | null; imagePath: string | null };

export async function getAbout(db: AdminDb): Promise<AdminAbout> {
  const { data, error } = await db
    .from("site_content")
    .select("body, image_path")
    .eq("key", KEY)
    .maybeSingle();
  if (error) throw new Error(`getAbout: ${error.message}`);
  return { body: data?.body ?? null, imagePath: data?.image_path ?? null };
}

export async function saveAboutBody(db: AdminDb, body: Json | null): Promise<void> {
  const { error } = await db.from("site_content").upsert({ key: KEY, body });
  if (error) throw new Error(`saveAboutBody: ${error.message}`);
}

/** שומרת את הנתיב החדש, ורק אחר כך מוחקת את הקובץ הישן */
export async function setAboutImage(db: AdminDb, path: string | null): Promise<void> {
  const { imagePath: previous } = await getAbout(db);

  const { error } = await db.from("site_content").upsert({ key: KEY, image_path: path });
  if (error) throw new Error(`setAboutImage: ${error.message}`);

  if (previous && previous !== path) {
    const { error: removeError } = await db.storage.from(IMAGES_BUCKET).remove([previous]);
    if (removeError) console.error("about image cleanup failed", removeError.message);
  }
}
