-- הרשאות: is_admin(), RLS על כל טבלה, ו-GRANT מפורש כשכבת הגנה שנייה.
-- הציבור (anon) קורא רק פרויקטים מפורסמים, התמונות שלהם ו-site_content.
-- אין לציבור הרשאת כתיבה לשום טבלה: האתר הציבורי כותב רק דרך השרת (service role).

-- is_admin ----------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- GRANT: מתחילים מאפס ונותנים רק מה שצריך ------------------------------------

revoke all on all tables in schema public from anon, authenticated;

-- טבלאות עתידיות לא יקבלו הרשאות ל-anon אוטומטית; כל GRANT ל-anon יהיה מפורש
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on functions from anon;

grant select on public.projects, public.project_images, public.site_content
  to anon;

grant select, insert, update, delete on
  public.projects,
  public.project_images,
  public.site_content,
  public.subscribers,
  public.subscriptions,
  public.campaigns,
  public.campaign_recipients,
  public.contact_messages
  to authenticated;

grant select on public.admin_roles to authenticated;
-- rate_limits: אין GRANT ל-anon או ל-authenticated. רק service role.

-- RLS ---------------------------------------------------------------------

alter table public.projects            enable row level security;
alter table public.project_images      enable row level security;
alter table public.subscribers         enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.campaigns           enable row level security;
alter table public.campaign_recipients enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.site_content        enable row level security;
alter table public.admin_roles         enable row level security;
alter table public.rate_limits         enable row level security;

-- projects
create policy "public reads published projects"
  on public.projects for select
  to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "admins insert projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_admin()));

-- project_images: גלויות רק אם הפרויקט שלהן מפורסם
create policy "public reads images of published projects"
  on public.project_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
    or (select public.is_admin())
  );

create policy "admins insert project images"
  on public.project_images for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update project images"
  on public.project_images for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete project images"
  on public.project_images for delete
  to authenticated
  using ((select public.is_admin()));

-- site_content
create policy "public reads site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "admins insert site content"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update site content"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete site content"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));

-- טבלאות מנהלים בלבד
create policy "admins manage subscribers"
  on public.subscribers for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins manage subscriptions"
  on public.subscriptions for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins manage campaigns"
  on public.campaigns for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins manage campaign recipients"
  on public.campaign_recipients for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins manage contact messages"
  on public.contact_messages for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- admin_roles: משתמש רואה את התפקיד של עצמו. אין כתיבה מהאפליקציה
-- (מנהלים נוספים דרך הסקריפט create-admin, עם service role).
create policy "users read own role"
  on public.admin_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- rate_limits: RLS מופעל בלי מדיניות, כלומר רק service role.
