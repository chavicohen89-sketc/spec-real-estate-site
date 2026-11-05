-- נתוני דוגמה לפיתוח. אפשר להריץ שוב בלי כפילויות (on conflict do nothing).
-- התמונות עצמן מועלות ל-Storage דרך: npm run db:seed-images
-- הטקסטים הם placeholder ויוחלפו בתוכן אמיתי של היזם.

insert into public.projects
  (id, title, slug, body, cover_image_path, status, sort_order, published_at)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'מגדלי הפארק',
    'park-towers',
    '{"type":"doc","content":[
      {"type":"paragraph","content":[{"type":"text","text":"שני מגדלי מגורים בני 24 קומות, מול פארק עירוני ירוק, במרחק הליכה מהרכבת הקלה."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"על הפרויקט"}]},
      {"type":"paragraph","content":[{"type":"text","text":"דירות של 3 עד 6 חדרים, עם מרפסות רחבות ותקרות גבוהות. "},{"type":"text","marks":[{"type":"bold"}],"text":"לובי בגובה כפול"},{"type":"text","text":" וחדר כושר לדיירים."}]},
      {"type":"bulletList","content":[
        {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"חניה תת-קרקעית"}]}]},
        {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"מחסן לכל דירה"}]}]},
        {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"גינה משותפת בקומת הקרקע"}]}]}
      ]}
    ]}'::jsonb,
    'seed/park-towers-cover.png',
    'published',
    1,
    now() - interval '30 days'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'בית על הים',
    'beach-house',
    '{"type":"doc","content":[
      {"type":"paragraph","content":[{"type":"text","text":"בניין בוטיק של 12 דירות, שתי דקות הליכה מחוף הים."}]},
      {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"מפרט"}]},
      {"type":"paragraph","content":[{"type":"text","text":"חיפוי אבן טבעית, חלונות אלומיניום רחבים ונוף פתוח לים מכל הדירות."}]}
    ]}'::jsonb,
    'seed/beach-house-cover.png',
    'published',
    2,
    now() - interval '10 days'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'שכונת הגפן (טיוטה)',
    'gefen-draft',
    '{"type":"doc","content":[
      {"type":"paragraph","content":[{"type":"text","text":"פרויקט בתכנון. לא אמור להופיע באתר הציבורי."}]}
    ]}'::jsonb,
    'seed/gefen-draft-cover.png',
    'draft',
    3,
    null
  )
on conflict (id) do nothing;

insert into public.project_images (id, project_id, image_path, alt, sort_order)
values
  ('a1111111-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'seed/park-towers-1.png', 'חזית המגדלים', 1),
  ('a1111111-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'seed/park-towers-2.png', 'הלובי', 2),
  ('a1111111-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'seed/park-towers-3.png', 'מרפסת עם נוף לפארק', 3),
  ('a2222222-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'seed/beach-house-1.png', 'הבניין מהטיילת', 1),
  ('a2222222-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'seed/beach-house-2.png', 'סלון עם נוף לים', 2),
  ('a3333333-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'seed/gefen-draft-1.png', 'הדמיה ראשונית', 1)
on conflict (id) do nothing;

insert into public.site_content (key, body, image_path)
values (
  'about',
  '{"type":"doc","content":[
    {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"מי אנחנו"}]},
    {"type":"paragraph","content":[{"type":"text","text":"[טקסט זמני: להחליף בתוכן של היזם] חברת ייזום ובנייה משפחתית, שבונה בתים שנעים לחזור אליהם כבר שלושה עשורים."}]},
    {"type":"paragraph","content":[{"type":"text","text":"אנחנו מאמינים בתכנון קפדני, בחומרים טובים ובשקיפות מול הלקוחות שלנו, מהחתימה ועד מסירת המפתח."}]}
  ]}'::jsonb,
  'seed/about.png'
)
on conflict (key) do nothing;
