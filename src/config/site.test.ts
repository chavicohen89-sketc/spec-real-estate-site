import { describe, expect, it } from "vitest";
import { siteConfig } from "./site";

describe("siteConfig", () => {
  it("לכל פריט בתפריט יש תווית וכתובת פנימית", () => {
    for (const item of siteConfig.nav) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("כתובות התפריט ייחודיות", () => {
    const hrefs = siteConfig.nav.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
