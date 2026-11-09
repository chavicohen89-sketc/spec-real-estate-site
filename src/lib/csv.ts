const BOM = "﻿";

/** תאים שמתחילים בתווים האלה מתפרשים באקסל כנוסחה */
const FORMULA_START = /^[=+\-@\t\r\n]/;

/** גרש בהתחלה גורם לאקסל להתייחס לערך כטקסט */
export function neutralizeCell(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

function cell(value: string): string {
  return `"${neutralizeCell(value).replace(/"/g, '""')}"`;
}

/** קובץ CSV שאקסל פותח בלחיצה כפולה עם עברית תקינה: UTF-8 עם BOM וסוף שורה CRLF */
export function buildCsv(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(","));
  return `${BOM}${lines.join("\r\n")}\r\n`;
}
