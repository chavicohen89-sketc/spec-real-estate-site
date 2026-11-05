import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";

/**
 * ההרחבות של טקסט עשיר. אותה רשימה בדיוק תשמש את העורך בממשק הניהול (שלב 5),
 * את האתר הציבורי ואת המיילים (שלב 7), כדי שמה שהמנהל רואה זה מה שמתפרסם.
 * עורך בסיסי לפי האפיון: כותרות משנה, הדגשה, רשימות, קישורים.
 */
export const richTextExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["mailto", "tel"],
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
    },
  }),
];

function isDoc(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc"
  );
}

/**
 * ממיר JSON של Tiptap ל-HTML. פונקציה אחת משותפת לאתר ולמיילים.
 * תוכן ריק או פגום מחזיר מחרוזת ריקה במקום להפיל את העמוד.
 * כתובות קישור לא בטוחות (למשל javascript:) מסוננות על ידי הרחבת Link.
 */
export function renderRichText(content: unknown): string {
  if (!isDoc(content)) return "";
  try {
    return renderToHTMLString({ content, extensions: richTextExtensions });
  } catch (error) {
    console.error("renderRichText failed", error);
    return "";
  }
}
