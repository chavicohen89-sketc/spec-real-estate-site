import { describe, expect, it } from "vitest";
import { styleEmailHtml } from "./email-html";

describe("styleEmailHtml", () => {
  it("adds inline styles and keeps existing attributes", () => {
    const out = styleEmailHtml('<p>a</p><a href="https://x.co">b</a>');
    expect(out).toMatch(/^<p style="[^"]+">a<\/p>/);
    expect(out).toContain('<a style="');
    expect(out).toContain('href="https://x.co"');
  });

  it("does not touch other tags or escaped text", () => {
    expect(styleEmailHtml("<pre>x</pre>")).toBe("<pre>x</pre>");
    expect(styleEmailHtml("&lt;p&gt;")).toBe("&lt;p&gt;");
  });

  it("never breaks the style attribute with font quotes", () => {
    const style = styleEmailHtml("<h2>x</h2>").match(/style="([^"]*)"/)?.[1];
    expect(style).toContain("font-family");
    expect(style).toContain("font-weight");
  });
});
