import { describe, expect, it } from "vitest";
import { formatDateTime, formatFileDate } from "./dates";

describe("formatDateTime", () => {
  it("בחורף שעון ישראל הוא UTC+2", () => {
    expect(formatDateTime("2026-01-15T10:05:00Z")).toBe("15/01/2026 12:05");
  });

  it("בקיץ שעון ישראל הוא UTC+3", () => {
    expect(formatDateTime("2026-07-15T10:05:00Z")).toBe("15/07/2026 13:05");
  });

  it("חצות נכתב 00 ולא 24", () => {
    expect(formatDateTime("2026-01-14T22:00:00Z")).toBe("15/01/2026 00:00");
  });
});

describe("formatFileDate", () => {
  it("היום מחושב בשעון ישראל", () => {
    expect(formatFileDate("2026-01-14T23:00:00Z")).toBe("2026-01-15");
  });
});
