/** שם ה-bucket של התמונות (שלב 2, מיגרציית storage) */
export const IMAGES_BUCKET = "images";

/**
 * כתובת ציבורית לתמונה ב-Storage. ה-bucket ציבורי לקריאה,
 * ולכן אין צורך בקריאה לשרת: הכתובת נבנית מהנתיב.
 */
export function imageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error("Missing env var NEXT_PUBLIC_SUPABASE_URL");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${IMAGES_BUCKET}/${encoded}`;
}
