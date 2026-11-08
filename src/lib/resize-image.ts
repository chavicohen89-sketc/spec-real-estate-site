export const MAX_IMAGE_SIDE = 2400;
const TARGET_BYTES = 1024 * 1024;
const QUALITIES = [0.82, 0.72, 0.62];

/** מידות חדשות ששומרות על היחס, בלי להגדיל תמונה קטנה */
export function fitWithin(width: number, height: number, maxSide = MAX_IMAGE_SIDE) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export type ResizedImage = { blob: Blob; extension: "webp" | "jpg" };

/**
 * מקטינה ודוחסת תמונה בדפדפן לפני העלאה: עד 2400 פיקסלים בצד הארוך, WebP באיכות 0.82.
 * דפדפן שלא יודע לקודד WebP מקבל JPEG. אם התוצאה עדיין מעל 1MB, יורדים באיכות.
 * קובץ שהדפדפן לא מצליח לפענח (למשל HEIC בכרום) זורק שגיאה.
 */
export async function resizeImage(file: File): Promise<ResizedImage> {
  // from-image: מכבד את הסיבוב ששמור בתמונה מהטלפון
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let result: ResizedImage | null = null;
  for (const quality of QUALITIES) {
    const webp = await encode(canvas, "image/webp", quality);
    const blob = webp?.type === "image/webp" ? webp : await encode(canvas, "image/jpeg", quality);
    if (!blob) throw new Error("Image encoding failed");
    result = { blob, extension: blob.type === "image/webp" ? "webp" : "jpg" };
    if (blob.size <= TARGET_BYTES) break;
  }
  return result!;
}
