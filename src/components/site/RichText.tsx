import { renderRichText } from "@/lib/rich-text";

type RichTextProps = {
  content: unknown;
  className?: string;
};

/**
 * מציג טקסט עשיר שנשמר מהעורך. ה-HTML נוצר בשרת מ-JSON דרך renderRichText,
 * שמבריח טקסט ומסנן קישורים לא בטוחים, ולכן מותר להזריק אותו.
 */
export function RichText({ content, className = "" }: RichTextProps) {
  const html = renderRichText(content);
  if (!html) return null;
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
