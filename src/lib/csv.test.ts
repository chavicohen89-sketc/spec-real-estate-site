import { describe, expect, it } from "vitest";
import { buildCsv, neutralizeCell } from "./csv";

describe("neutralizeCell", () => {
  it.each(["=SUM(A1)", "+972501234567", "-1+1", "@cmd", "\tx", "\rx", "\nx"])(
    "מנטרל ערך שמתחיל בתו מסוכן: %j",
    (value) => {
      expect(neutralizeCell(value)).toBe(`'${value}`);
    },
  );

  it.each(["דנה כהן", "a=b", "050-1234567", ""])("לא נוגע בערך רגיל: %j", (value) => {
    expect(neutralizeCell(value)).toBe(value);
  });
});

describe("buildCsv", () => {
  it("מתחיל ב-BOM ומסתיים ב-CRLF", () => {
    const csv = buildCsv(["שם"], [["דנה"]]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe('"שם"\r\n"דנה"\r\n');
  });

  it("פסיק, גרשיים וירידת שורה נשארים בתוך תא אחד", () => {
    expect(buildCsv(["a"], [['x, "y"\nz']]).slice(1)).toBe('"a"\r\n"x, ""y""\nz"\r\n');
  });

  it("הנטרול חל גם על תא בתוך גרשיים", () => {
    expect(buildCsv(["a"], [["=1+1"]]).slice(1)).toBe('"a"\r\n"\'=1+1"\r\n');
  });
});
