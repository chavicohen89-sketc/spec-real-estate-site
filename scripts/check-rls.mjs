// בדיקת RLS: מריץ שאילתות עם המפתח הציבורי (anon), כמו דפדפן של גולש,
// ומוודא שהוא רואה רק מה שמותר ולא יכול לכתוב כלום.
// דורש שה-seed הוחל (supabase db push --include-seed ו-npm run db:seed-images).
// הרצה: npm run db:check-rls

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error("חסרים משתני Supabase ב-.env.local");
  process.exit(1);
}

const opts = { auth: { persistSession: false } };
const anon = createClient(url, anonKey, opts);
const service = createClient(url, serviceKey, opts);

const DRAFT_ID = "33333333-3333-4333-8333-333333333333";
let failures = 0;

function check(name, ok, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  (${detail})` : ""}`);
}

const blocked = ({ data, error }) =>
  error ? `error: ${error.code ?? error.message}` : `rows: ${data?.length ?? 0}`;
const noData = (r) => !!r.error || (r.data?.length ?? 0) === 0;

// --- קריאה ציבורית מותרת ---
{
  const r = await anon.from("projects").select("slug, status");
  const slugs = (r.data ?? []).map((p) => p.slug).sort().join(",");
  check(
    "anon רואה רק פרויקטים מפורסמים",
    !r.error && r.data.length > 0 && r.data.every((p) => p.status === "published"),
    r.error?.message ?? slugs,
  );
}
{
  const r = await anon.from("projects").select("id").eq("id", DRAFT_ID);
  // דורשים תשובה ריקה בלי שגיאה: שגיאה כאן מסתירה באג במדיניות, לא חסימה
  check("פרויקט בטיוטה לא חוזר ל-anon", !r.error && r.data.length === 0, blocked(r));
}
{
  const r = await anon.from("project_images").select("project_id");
  check(
    "anon רואה תמונות רק של פרויקטים מפורסמים",
    !r.error && r.data.length > 0 && r.data.every((i) => i.project_id !== DRAFT_ID),
    r.error?.message ?? `rows: ${r.data.length}`,
  );
}
{
  const r = await anon.from("site_content").select("key").eq("key", "about");
  check("anon קורא את site_content", !r.error && r.data.length === 1, blocked(r));
}

// --- קריאה אסורה ---
for (const table of [
  "subscribers",
  "subscriptions",
  "campaigns",
  "campaign_recipients",
  "contact_messages",
  "admin_roles",
  "rate_limits",
]) {
  const r = await anon.from(table).select("*").limit(1);
  check(`anon לא קורא מ-${table}`, noData(r), blocked(r));
}

// --- כתיבה אסורה ---
{
  const r = await anon.from("subscribers").insert({
    full_name: "בדיקת RLS",
    email: "rls-check@example.com",
    phone: "+972501234567",
    email_consent_at: new Date().toISOString(),
  });
  check("הכנסה ל-subscribers נכשלת ל-anon", !!r.error, r.error?.code ?? "הצליח!");
}
{
  const r = await anon.from("contact_messages").insert({
    full_name: "בדיקת RLS",
    email: "rls-check@example.com",
    message: "x",
  });
  check("הכנסה ל-contact_messages נכשלת ל-anon", !!r.error, r.error?.code ?? "הצליח!");
}
{
  const r = await anon
    .from("projects")
    .update({ status: "published" })
    .eq("id", DRAFT_ID)
    .select("id");
  check("anon לא יכול לפרסם פרויקט", noData(r), blocked(r));
}
{
  const r = await anon.rpc("is_admin");
  check("is_admin() מחזיר false ל-anon", !r.error && r.data === false, r.error?.code ?? String(r.data));
}

// --- Storage ---
{
  const r = await anon.storage
    .from("images")
    .upload("rls-check.png", new Uint8Array([1, 2, 3]), { contentType: "image/png" });
  check("anon לא מעלה קבצים ל-images", !!r.error, r.error?.message ?? "הצליח!");
}
{
  const r = await anon.storage.from("images").remove(["seed/about.png"]);
  check("anon לא מוחק קבצים מ-images", noData(r), blocked(r));
}
{
  const { data } = anon.storage.from("images").getPublicUrl("seed/park-towers-cover.png");
  const res = await fetch(data.publicUrl, { method: "HEAD" });
  check("תמונה נקראת בכתובת ציבורית", res.ok, `HTTP ${res.status}`);
}

// --- בקרה: service role רואה הכל ---
{
  const r = await service.from("projects").select("id");
  check("service role רואה גם את הטיוטה", !r.error && r.data.length === 3, blocked(r));
}

console.log(failures ? `\n${failures} בדיקות נכשלו` : "\nכל הבדיקות עברו");
process.exit(failures ? 1 : 0);
