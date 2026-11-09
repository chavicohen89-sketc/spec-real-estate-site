import { emailColors as c, emailFonts as f } from "@/emails/_shared/theme";

const STYLES: Record<string, string> = {
  p: "margin:0 0 16px;font-size:16px;line-height:26px",
  h2: `margin:24px 0 12px;font-family:${f.serif.replaceAll('"', "'")};font-size:22px;line-height:30px;font-weight:400`,
  h3: `margin:20px 0 8px;font-family:${f.serif.replaceAll('"', "'")};font-size:18px;line-height:26px;font-weight:400`,
  ul: "margin:0 0 16px;padding:0 20px 0 0",
  ol: "margin:0 0 16px;padding:0 20px 0 0",
  li: "margin:0 0 4px",
  a: `color:${c.charcoal};text-decoration:underline`,
};

/**
 * תוכנות דואר לא אמינות עם גיליון סגנונות, ולכן מוסיפים style לכל תגית
 * בפלט של renderRichText. הטקסט עצמו כבר מקודד, כך ש-"<p" מופיע רק כתגית אמיתית.
 */
export function styleEmailHtml(html: string): string {
  return html.replace(/<(p|h2|h3|ul|ol|li|a)(?=[\s>])/g, (_, tag: string) => `<${tag} style="${STYLES[tag]}"`);
}
