/** אות עברית -> אותיות לטיניות. אותיות שתלויות במיקום מטופלות ב-transliterateWord */
const LETTERS: Record<string, string> = {
  א: "a",
  ג: "g",
  ד: "d",
  ז: "z",
  ח: "ch",
  ט: "t",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "a",
  ף: "f",
  צ: "tz",
  ץ: "tz",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

function transliterateWord(word: string): string {
  const chars = [...word];
  return chars
    .map((char, index) => {
      const first = index === 0;
      const last = index === chars.length - 1;
      switch (char) {
        case "ב":
          return first ? "b" : "v";
        case "פ":
          return first ? "p" : "f";
        case "ו":
          return first ? "v" : "o";
        case "י":
          return first ? "y" : "i";
        case "ה":
          return last ? "a" : "h";
        default:
          return LETTERS[char] ?? char;
      }
    })
    .join("");
}

/**
 * הצעה לכתובת דף מתוך שם הפרויקט: תעתיק מעברית לאנגלית,
 * אותיות קטנות, מספרים ומקפים. זו הצעה בלבד, והמנהל יכול לערוך אותה.
 * מחזיר מחרוזת ריקה אם לא נשאר שום תו שמיש.
 */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[֑-ׇ]/g, "") // ניקוד וטעמים
    .replace(/['"`׳״]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .map(transliterateWord)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "");
}
