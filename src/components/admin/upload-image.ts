import { resizeImage } from "@/lib/resize-image";
import { IMAGES_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

/**
 * מקטינה ומעלה תמונה ישירות מהדפדפן ל-Storage (ההרשאה מגיעה מ-RLS של המנהל),
 * כי ל-Server Actions ב-Vercel יש מגבלת גודל. מחזירה את הנתיב.
 */
export async function uploadProjectImage(projectId: string, file: File): Promise<string> {
  const { blob, extension } = await resizeImage(file);
  const path = `projects/${projectId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await createClient()
    .storage.from(IMAGES_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw error;
  return path;
}

/** מחיקת קובץ שהועלה אבל לא נקשר לפרויקט (השמירה נכשלה) */
export async function removeUploadedImage(path: string): Promise<void> {
  await createClient().storage.from(IMAGES_BUCKET).remove([path]);
}
