import { describe, expect, it } from "vitest";
import { formatLocalPhone, normalizeIsraeliPhone } from "./phone";

describe("normalizeIsraeliPhone", () => {
  it.each([
    "050-1234567",
    "0501234567",
    "050 123 4567",
    "(050) 123-4567",
    "050.123.4567",
    "+972 50 123 4567",
    "+972-50-1234567",
    "+972501234567",
    "972501234567",
    "00972501234567",
    "+972 050 123 4567",
    "  0501234567  ",
    "‎050-1234567‏",
    "‪+972 50-123-4567‬",
  ])("מנרמל את %j", (input) => {
    expect(normalizeIsraeliPhone(input)).toBe("+972501234567");
  });

  it("שומר על הקידומת והספרות של המספר", () => {
    expect(normalizeIsraeliPhone("058-7654321")).toBe("+972587654321");
  });

  it.each([
    "",
    "   ",
    "050123456", // קצר מדי
    "05012345678", // ארוך מדי
    "+97250123456", // קצר מדי
    "+9725012345678", // ארוך מדי
    "501234567", // בלי קידומת
    "02-1234567", // קווי
    "+97221234567", // קווי
    "+1 202 555 0123", // חו"ל
    "050123456a",
    "abc",
    "++972501234567",
    "0501234567 ext 5",
  ])("דוחה את %j", (input) => {
    expect(normalizeIsraeliPhone(input)).toBeNull();
  });
});

describe("formatLocalPhone", () => {
  it("מחזיר פורמט מקומי עם מקף", () => {
    expect(formatLocalPhone("+972501234567")).toBe("050-1234567");
  });
});
