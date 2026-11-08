import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("מתעתק עברית", () => {
    expect(slugify("תל אביב")).toBe("tl-aviv");
    expect(slugify("בית על הים")).toBe("bit-al-him");
  });

  it("מסיר ניקוד וגרשיים", () => {
    expect(slugify('שָׁלוֹם')).toBe("shlom");
    expect(slugify('בי"ס')).toBe("bis");
  });

  it("משאיר אנגלית ומספרים, באותיות קטנות", () => {
    expect(slugify("Park Towers 2")).toBe("park-towers-2");
  });

  it("מאחד רווחים וסימנים ומנקה קצוות", () => {
    expect(slugify("  מגדל -- A!  ")).toBe("mgdl-a");
  });

  it("התוצאה תמיד עומדת באילוץ של המסד", () => {
    const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const title of ["פרויקט חדש", "A & B", "מגדלי הים - שלב ב'", "א".repeat(200)]) {
      expect(slugify(title)).toMatch(pattern);
    }
  });

  it("מחזיר ריק כשאין תווים שמישים", () => {
    expect(slugify("!!! ---")).toBe("");
  });
});
