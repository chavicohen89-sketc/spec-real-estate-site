import { describe, expect, it } from "vitest";
import { renderRichText } from "./rich-text";

const doc = (...content: object[]) => ({ type: "doc", content });
const p = (...content: object[]) => ({ type: "paragraph", content });
const text = (t: string, marks?: object[]) => ({ type: "text", text: t, marks });

describe("renderRichText", () => {
  it("renders headings, bold and lists", () => {
    const html = renderRichText(
      doc(
        { type: "heading", attrs: { level: 2 }, content: [text("כותרת")] },
        p(text("רגיל "), text("מודגש", [{ type: "bold" }])),
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [p(text("פריט"))] }],
        },
      ),
    );
    expect(html).toContain("<h2>כותרת</h2>");
    expect(html).toContain("<strong>מודגש</strong>");
    expect(html).toMatch(/<ul>\s*<li>\s*<p>פריט<\/p>\s*<\/li>\s*<\/ul>/);
  });

  it("escapes HTML in text", () => {
    const html = renderRichText(doc(p(text("<script>alert(1)</script>"))));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("keeps safe links and adds rel", () => {
    const html = renderRichText(
      doc(p(text("קישור", [{ type: "link", attrs: { href: "https://example.com" } }]))),
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer nofollow"');
  });

  it("drops javascript: links", () => {
    const html = renderRichText(
      doc(p(text("רע", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]))),
    );
    expect(html).not.toContain("javascript:");
  });

  it("returns empty string for empty or malformed content", () => {
    expect(renderRichText(null)).toBe("");
    expect(renderRichText("hello")).toBe("");
    expect(renderRichText({ type: "paragraph" })).toBe("");
    expect(renderRichText(doc({ type: "noSuchNode" }))).toBe("");
  });
});
