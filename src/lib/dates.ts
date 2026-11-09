const TIME_ZONE = "Asia/Jerusalem";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parts(value: string | Date) {
  const map = Object.fromEntries(
    formatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return { day: map.day, month: map.month, year: map.year, hour: map.hour, minute: map.minute };
}

/** תאריך ושעה בפורמט ישראלי, בשעון ישראל: 09/11/2026 14:30 */
export function formatDateTime(value: string | Date): string {
  const { day, month, year, hour, minute } = parts(value);
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

/** תאריך בלבד בשעון ישראל, לשם קובץ: 2026-11-09 */
export function formatFileDate(value: string | Date): string {
  const { day, month, year } = parts(value);
  return `${year}-${month}-${day}`;
}
