-- bucket תמונות: קריאה ציבורית דרך URL ציבורי, כתיבה ומחיקה רק למנהלים.
-- הערה: bucket ציבורי, כך שתמונה של פרויקט בטיוטה נגישה למי שיודע את הנתיב המדויק.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  10485760, -- 10MB. התמונות מוקטנות בדפדפן לפני העלאה, זו רק רשת ביטחון
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- רשימת קבצים דרך ה-API רק למנהלים (ה-URL הציבורי עובד בלי מדיניות)
create policy "admins list images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));

create policy "admins upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images' and (select public.is_admin()));

create policy "admins update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()))
  with check (bucket_id = 'images' and (select public.is_admin()));

create policy "admins delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));
