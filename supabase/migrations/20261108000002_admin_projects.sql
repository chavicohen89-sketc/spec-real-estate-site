-- ניהול פרויקטים: שמירת התשובה לדיאלוג הפרסום, פרסום אטומי ושינוי סדר אטומי.
-- הפונקציות רצות בהרשאות המשתמש (security invoker), כך שגם RLS חל עליהן.
-- הבדיקה המפורשת של is_admin נותנת שגיאה ברורה במקום "0 שורות עודכנו".

-- התשובה לשאלה "לשלוח מייל לנרשמים הכלליים?" בפרסום הראשון. שלב 7 ישתמש בה.
alter table public.projects
  add column launch_email_requested boolean not null default false;

-- פרסום: published_at נקבע רק בפעם הראשונה, והתשובה נשמרת רק בפעם הראשונה.
-- פרויקט בלי תמונה ראשית לא מתפרסם. מחזירה true אם הפרויקט פורסם.
create function public.publish_project(
  p_id uuid,
  p_send_launch_email boolean
)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.projects
  set status = 'published',
      published_at = coalesce(published_at, now()),
      launch_email_requested = case
        when published_at is null then p_send_launch_email
        else launch_email_requested
      end
  where id = p_id
    and cover_image_path is not null;

  return found;
end;
$$;

-- קובעת את הסדר לפי מיקום המזהה במערך, בפעולה אחת.
create function public.reorder_projects(p_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.projects p
  set sort_order = o.position
  from unnest(p_ids) with ordinality as o(id, position)
  where p.id = o.id;
end;
$$;

create function public.reorder_project_images(p_project_id uuid, p_ids uuid[])
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.project_images i
  set sort_order = o.position
  from unnest(p_ids) with ordinality as o(id, position)
  where i.id = o.id
    and i.project_id = p_project_id;
end;
$$;

revoke execute on function public.publish_project(uuid, boolean) from public, anon;
revoke execute on function public.reorder_projects(uuid[]) from public, anon;
revoke execute on function public.reorder_project_images(uuid, uuid[]) from public, anon;

grant execute on function public.publish_project(uuid, boolean) to authenticated;
grant execute on function public.reorder_projects(uuid[]) to authenticated;
grant execute on function public.reorder_project_images(uuid, uuid[]) to authenticated;
