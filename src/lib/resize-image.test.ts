import { describe, expect, it } from "vitest";
import { fitWithin } from "./resize-image";

describe("fitWithin", () => {
  it("מקטינה לפי הצד הארוך ושומרת על היחס", () => {
    expect(fitWithin(4800, 3600)).toEqual({ width: 2400, height: 1800 });
    expect(fitWithin(3000, 6000)).toEqual({ width: 1200, height: 2400 });
  });

  it("לא מגדילה תמונה קטנה", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
