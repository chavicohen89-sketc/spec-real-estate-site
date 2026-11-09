export const PAGE_SIZE = 25;

/** קוד השגיאה של PostgREST כשמבקשים עמוד שמעבר לסוף הרשימה */
export const RANGE_NOT_SATISFIABLE = "PGRST103";

export function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function pageRange(page: number): [from: number, to: number] {
  const from = (page - 1) * PAGE_SIZE;
  return [from, from + PAGE_SIZE - 1];
}
