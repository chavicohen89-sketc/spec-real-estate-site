import { describe, expect, it } from "vitest";
import {
  parseSubscribersFilter,
  subscribersFilterQuery,
  subscribersSearchClause,
} from "./subscribers-filter";

const id = "7f3c2b1a-1234-4abc-8def-0123456789ab";

describe("parseSubscribersFilter", () => {
  it("ברירות מחדל כשאין פרמטרים", () => {
    expect(parseSubscribersFilter({})).toEqual({ q: "", project: "all", status: "all", page: 1 });
  });

  it("קורא ערכים תקינים", () => {
    expect(parseSubscribersFilter({ q: " דנה ", project: id, status: "active", page: "3" })).toEqual({
      q: "דנה",
      project: id,
      status: "active",
      page: 3,
    });
    expect(parseSubscribersFilter({ project: "general" }).project).toBe("general");
  });

  it("ערכים לא תקינים נחשבים כלא נבחרו", () => {
    expect(parseSubscribersFilter({ project: "x", status: "y", page: "-2" })).toEqual({
      q: "",
      project: "all",
      status: "all",
      page: 1,
    });
    expect(parseSubscribersFilter({ page: "1.5" }).page).toBe(1);
  });
});

describe("subscribersFilterQuery", () => {
  it("ריק כשהכול ברירת מחדל", () => {
    expect(subscribersFilterQuery({ q: "", project: "all", status: "all", page: 1 })).toBe("");
  });

  it("אפשר להחליף עמוד, ועמוד 1 לא נכתב", () => {
    const filter = { q: "", project: "general", status: "active", page: 2 } as const;
    expect(subscribersFilterQuery(filter)).toBe("?project=general&status=active&page=2");
    expect(subscribersFilterQuery(filter, 1)).toBe("?project=general&status=active");
  });
});

describe("subscribersSearchClause", () => {
  it("טקסט מחפש בשם ובאימייל בלבד", () => {
    expect(subscribersSearchClause("דנה")).toBe('full_name.ilike."%דנה%",email.ilike."%דנה%"');
  });

  it("טלפון מקומי מחפש בלי מקפים ובלי האפס שבהתחלה", () => {
    expect(subscribersSearchClause("050-123")).toContain('phone.ilike."%50123%"');
  });

  it("קידומת בינלאומית מוסרת", () => {
    expect(subscribersSearchClause("+972 50")).toContain('phone.ilike."%50%"');
  });

  it("תווים מיוחדים לא שוברים את התנאי", () => {
    expect(subscribersSearchClause('a,b"c')).toBe(
      'full_name.ilike."%a,b\\"c%",email.ilike."%a,b\\"c%"',
    );
    expect(subscribersSearchClause("100%")).toContain('"%100\\\\%%"');
  });
});
