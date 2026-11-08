// יצירת מנהל: npm run create-admin -- email@example.com
// משתמש חדש מקבל סיסמה זמנית אקראית, שמודפסת פעם אחת בלבד.
// משתמש קיים מקבל הרשאת מנהל, והסיסמה שלו לא משתנה.

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("חסרים משתני Supabase ב-.env.local");
  process.exit(1);
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("שימוש: npm run create-admin -- email@example.com");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function findUserByEmail(target) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((u) => u.email === target);
    if (user || data.users.length < 200) return user ?? null;
  }
}

let user = await findUserByEmail(email);
let password = null;

if (!user) {
  password = randomBytes(15).toString("base64url");
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error(`יצירת המשתמש נכשלה: ${error.message}`);
    process.exit(1);
  }
  user = data.user;
}

const { error } = await supabase
  .from("admin_roles")
  .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id" });
if (error) {
  console.error(`הוספת ההרשאה נכשלה: ${error.message}`);
  process.exit(1);
}

console.log(`✓ ${email} הוא מנהל`);
if (password) {
  console.log(`סיסמה זמנית: ${password}`);
  console.log("היא לא תוצג שוב. מומלץ להחליף אותה דרך \"שכחתי סיסמה\".");
}
