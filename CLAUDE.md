# CLAUDE.md

אתר פרויקטים ליזם נדל"ן: אתר תדמית בעברית, הרשמה לעדכונים, ממשק ניהול ודיוור.

- **מה בונים:** `spec-real-estate-site.md` (האפיון, מקור האמת).
- **באיזה סדר:** `PLAN.md` (שלבים, בדיקות, יומן התקדמות).

## סטאק

Next.js (App Router) + TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Resend + React Email · Tiptap · shadcn/ui (בממשק הניהול בלבד) · Vercel.

לפני שימוש ב-API של ספרייה, לבדוק את הגרסה המותקנת ב-`package.json` ואת התיעוד שלה. Next.js, Tailwind ו-Supabase משנים API בין גרסאות ראשיות (למשל `middleware.ts` שהפך ל-`proxy.ts` ב-Next 16, ו-`tailwind.config` שהפך ל-`@theme` ב-Tailwind v4).

## פקודות

```bash
npm run dev          # שרת פיתוח
npm run build        # חייב לעבור לפני כל commit
npm run lint
npm run typecheck
npm test             # Vitest, בדיקות יחידה
npm run email:dev    # תצוגה מקדימה של תבניות המייל (פורט 3001)
npm run db:types     # יצירת טיפוסים מחדש אחרי כל מיגרציה
npm run db:push      # החלת מיגרציות (npx supabase db push; ה-CLI מותקן מקומית, לא גלובלית)
npm run db:check-rls # בדיקת RLS עם המפתח הציבורי. להריץ אחרי כל מיגרציה שנוגעת בהרשאות
npm run db:seed-images  # העלאת תמונות placeholder של ה-seed ל-Storage
npm run create-admin -- email@x.com  # יצירת מנהל (משתמש חדש מקבל סיסמה זמנית)
```

## מבנה

```
src/
  app/(site)/         האתר הציבורי
  app/admin/          ממשק הניהול
  app/api/            Route Handlers (CSV, unsubscribe)
  components/site/    קומפוננטות של האתר הציבורי
  components/admin/   קומפוננטות של הניהול
  server/             לוגיקה עסקית בצד שרת (subscribe, email, campaigns)
  lib/supabase/       server.ts, client.ts, admin.ts (service role)
  lib/validation/     סכמות zod
  lib/strings.ts      כל טקסטי הממשק
  config/site.ts      פרטי היזם, תפריט, פרטי קשר
  emails/             תבניות React Email
supabase/migrations/  מיגרציות SQL
supabase/seed.sql
```

## כללים

**טקסט ושפה**
- כל טקסט שהמשתמש רואה מגיע מ-`src/lib/strings.ts`. בלי מחרוזות עבריות בתוך קומפוננטות.
- ממשק הניהול בעברית פשוטה, בלי מונחים טכניים ("כתובת הדף", לא "slug").
- תאריכים: פורמט ישראלי, אזור זמן `Asia/Jerusalem`, דרך פונקציה אחת משותפת.

**RTL ועיצוב**
- רק מחלקות לוגיות: `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`. לעולם לא `ml-`/`mr-`/`left-`/`right-`/`text-left`.
- צבעים רק דרך ה-tokens (`cream`, `charcoal`, `warm-gray`, `accent`). אין hex בקומפוננטות. חריג יחיד: מיילים, שבהם הערכים מרוכזים ב-`src/emails/_shared/theme.ts`, כי תוכנות דואר לא תומכות במשתני CSS.
- עיצוב האתר הציבורי: הרבה אוויר, קווים דקים במקום צללים, פינות כמעט ישרות, תנועה עדינה בלבד. מובייל קודם.
- תמונות רק דרך `next/image`, עם `sizes`.
- רכיבי shadcn נמצאים ב-`src/components/admin/ui`, וממופים ל-4 ה-tokens ב-`globals.css`. רכיב חדש מה-CLI: להסיר `dark:`, להחליף `bg-accent` ב-`bg-muted` ו-`left`/`right` במקבילות לוגיות, ולייבא `cn` מ-`@/lib/utils`.

**ארכיטקטורה**
- Server Components כברירת מחדל. `"use client"` רק כשבאמת צריך אינטראקציה.
- כתיבות דרך Server Actions. ה-Action דק: ולידציה עם zod, בדיקת הרשאה, וקריאה לפונקציה ב-`src/server/`.
- כל Server Action וכל Route Handler של הניהול בודק `is_admin` בעצמו. middleware/proxy הוא נוחות, לא אבטחה.
- `src/lib/supabase/admin.ts` מתחיל ב-`import "server-only"`. ה-service role key לא מגיע לדפדפן לעולם.
- Resend נקרא רק מתוך `src/server/email.ts`.
- אחרי כל שינוי תוכן בניהול: `updateTag` (ב-Server Action) עם התגים מ-`cacheTags` ב-`src/server/content.ts` (`projects`, `project:<slug>`, `site-content:<key>`). שינוי slug: לרענן גם את הישן וגם את החדש.
- שליפות של האתר הציבורי רק דרך `src/server/content.ts` (`"use cache"` + לקוח anon בלי עוגיות).
- טקסט עשיר: `renderRichText` ו-`richTextExtensions` מ-`src/lib/rich-text.ts`. העורך משתמש באותן הרחבות בדיוק.
- לא להוסיף ספרייה בלי סיבה. אם מוסיפים, לכתוב למה בסיכום השלב.

**מסד נתונים**
- כל שינוי סכמה הוא קובץ מיגרציה חדש ב-`supabase/migrations/`. לא עורכים מיגרציה קיימת שכבר הוחלה.
- RLS מופעל על כל טבלה. מדיניות של מנהלים משתמשת ב-`(select public.is_admin())`.
- **GRANT מפורש לכל טבלה חדשה.** ה-default privileges בוטלו ל-`anon`, כך שטבלה חדשה לא נגישה לציבור עד שנותנים לה GRANT. ל-`authenticated` צריך GRANT מפורש לפעולות שהמנהל עושה (ה-RLS מגביל ל-`is_admin()`).
- סטטוסים כ-`text` עם `check`, לא `enum`. מייל נשמר באותיות קטנות (נאכף ב-`check`).
- אחרי מיגרציה: `npm run db:types`.
- פעולות "פעם אחת בלבד" (כמו מייל פרויקט חדש) נאכפות ב-SQL אטומי, לא בבדיקה ב-JavaScript.

## איך עובדים כאן

- עובדים על **שלב אחד** מ-`PLAN.md` בכל סשן. מתחילים בתוכנית קצרה לאישור, ולא כותבים קוד לפני האישור.
- לפני שמכריזים שמשהו גמור: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, ובדיקה בדפדפן לכל שינוי שנראה לעין (375px ו-1440px).
- החלטה חדשה שלא מופיעה באפיון: לשאול. אחרי שהוחלט, לעדכן את האפיון או את הקובץ הזה כדי שהסשן הבא יידע.
- בסוף כל שלב: עדכון "יומן התקדמות" ב-`PLAN.md`, ו-commit עם הודעה ברורה.
- לא עושים commit לסודות. `.env.local` ב-`.gitignore`, ו-`.env.example` מעודכן בכל משתנה חדש.
