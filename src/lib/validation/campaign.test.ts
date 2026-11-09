import { describe, expect, it } from "vitest";
import { richTextExcerpt } from "@/lib/rich-text";
import { audienceSchema, campaignContentSchema } from "./campaign";

const doc = (text: string) => ({
  type: "doc",
  content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : undefined }],
});

describe("campaignContentSchema", () => {
  it("accepts a subject and body", () => {
    expect(campaignContentSchema.safeParse({ subject: " שלום ", body: doc("טקסט") }).data?.subject).toBe("שלום");
  });

  it("rejects an empty subject or a body with no text", () => {
    expect(campaignContentSchema.safeParse({ subject: "  ", body: doc("טקסט") }).success).toBe(false);
    expect(campaignContentSchema.safeParse({ subject: "שלום", body: doc("  ") }).success).toBe(false);
  });
});

describe("audienceSchema", () => {
  it("requires a real project id for a project audience", () => {
    expect(audienceSchema.safeParse({ type: "project", projectId: "x" }).success).toBe(false);
    expect(audienceSchema.safeParse({ type: "general" }).success).toBe(true);
  });
});

describe("richTextExcerpt", () => {
  it("joins paragraphs and cuts on a word boundary", () => {
    expect(richTextExcerpt(doc("אחת שתיים שלוש"), 10)).toBe("אחת שתיים…");
    expect(richTextExcerpt(null)).toBe("");
  });
});
