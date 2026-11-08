import { describe, expect, it } from "vitest";
import { isProjectImagePath, newPasswordSchema, projectSchema } from "./admin";

const ID = "33333333-3333-4333-8333-333333333333";

describe("isProjectImagePath", () => {
  it("מקבל קובץ בתיקיית הפרויקט", () => {
    expect(isProjectImagePath(ID, `projects/${ID}/abc-123.webp`)).toBe(true);
  });

  it("דוחה תיקייה אחרת, תת-תיקייה וסיומת אחרת", () => {
    expect(isProjectImagePath(ID, "projects/other/abc.webp")).toBe(false);
    expect(isProjectImagePath(ID, `projects/${ID}/../x.webp`)).toBe(false);
    expect(isProjectImagePath(ID, `projects/${ID}/abc.svg`)).toBe(false);
  });
});

describe("projectSchema", () => {
  const valid = { title: "פרויקט", slug: "my-project", body: null };

  it("מקבל פרויקט תקין", () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
    const body = { type: "doc", content: [{ type: "paragraph" }] };
    expect(projectSchema.safeParse({ ...valid, body }).success).toBe(true);
  });

  it("דוחה כתובת לא תקינה", () => {
    for (const slug of ["עברית", "Big", "-a", "a--b", ""]) {
      expect(projectSchema.safeParse({ ...valid, slug }).success).toBe(false);
    }
  });

  it("דוחה טקסט שאינו מסמך או ארוך מדי", () => {
    expect(projectSchema.safeParse({ ...valid, body: { type: "x" } }).success).toBe(false);
    const body = { type: "doc", content: [{ text: "א".repeat(200_001) }] };
    expect(projectSchema.safeParse({ ...valid, body }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("דורש 8 תווים ושתי סיסמאות זהות", () => {
    expect(newPasswordSchema.safeParse({ password: "12345678", confirm: "12345678" }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ password: "1234567", confirm: "1234567" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "12345678", confirm: "87654321" }).success).toBe(false);
  });
});
