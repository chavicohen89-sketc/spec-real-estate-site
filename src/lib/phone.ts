// רווחים, מקפים, סוגריים, נקודות ותווי כיווניות נסתרים שמגיעים בהעתקה מאנשי קשר
const SEPARATORS = /[\s\-().‎‏‪-‮⁦-⁩]/g;

const LOCAL_MOBILE = /^0(5\d{8})$/;
const INTERNATIONAL_MOBILE = /^(?:\+972|00972|972)0?(5\d{8})$/;

/**
 * מנרמל מספר נייד ישראלי לפורמט +9725XXXXXXXX.
 * מחזיר null אם המספר אינו נייד ישראלי תקין.
 */
export function normalizeIsraeliPhone(input: string): string | null {
  const compact = input.replace(SEPARATORS, "");
  const match = compact.match(LOCAL_MOBILE) ?? compact.match(INTERNATIONAL_MOBILE);
  return match ? `+972${match[1]}` : null;
}

/** להצגה ולייצוא: +972501234567 הופך ל-050-1234567 */
export function formatLocalPhone(phone: string): string {
  const local = phone.replace(/^\+972/, "0");
  return `${local.slice(0, 3)}-${local.slice(3)}`;
}
