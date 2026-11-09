/**
 * הצבעים של המיילים. תוכנות דואר לא תומכות במשתני CSS, ולכן זה המקום היחיד
 * שבו ערכי ה-tokens מ-globals.css מופיעים כ-hex. שינוי שם צריך להתעדכן גם כאן.
 */
export const emailColors = {
  cream: "#faf8f5",
  charcoal: "#1c1c1c",
  warmGray: "#6b645c",
  accent: "#b08d57",
} as const;

export const emailFonts = {
  serif: '"Times New Roman", Georgia, serif',
  sans: "Arial, Helvetica, sans-serif",
} as const;
