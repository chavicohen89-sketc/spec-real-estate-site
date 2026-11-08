-- טפסים ציבוריים: מונה הגבלת קצב אטומי, והרשמה אטומית.
-- שתי הפונקציות נקראות רק מהשרת (service role).

-- הגבלת קצב ----------------------------------------------------------------

create index rate_limits_window_idx on public.rate_limits (window_start);

-- מוסיפה 1 למונה של החלון הנוכחי, ומחזירה true אם השליחה עדיין מותרת.
create function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_window timestamptz := date_bin(
    make_interval(secs => p_window_seconds),
    now(),
    'epoch'::timestamptz
  );
  v_count integer;
begin
  delete from public.rate_limits
  where window_start < v_window - interval '1 day';

  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = r.count + 1
  returning r.count into v_count;

  return v_count <= p_limit;
end;
$$;

-- הרשמה --------------------------------------------------------------------

-- כל ההרשמה בטרנזקציה אחת: נרשם חדש, נרשם קיים, או מי שהוסר וחוזר.
-- לא מחזירה שורות אם הפרויקט לא קיים או לא מפורסם (ואז לא נשמר כלום).
--
-- נרשם פעיל: הסכמת המייל המקורית נשמרת, ואי-סימון ווטסאפ אינו ביטול הסכמה.
-- מי שהוסר וחוזר: הסכמה חדשה, וההרשמות הישנות נמחקות, כי ההסכמה החדשה חלה
-- רק על מה שנרשם אליו עכשיו.
create function public.upsert_subscription(
  p_full_name text,
  p_email text,
  p_phone text,
  p_whatsapp_consent boolean,
  p_project_id uuid default null,
  p_source_ip text default null
)
returns table (subscriber_id uuid, is_new_subscription boolean)
language plpgsql
set search_path = ''
as $$
declare
  v_subscriber_id uuid;
  v_unsubscribed_at timestamptz;
  v_inserted integer;
begin
  if p_project_id is not null and not exists (
    select 1 from public.projects
    where id = p_project_id and status = 'published'
  ) then
    return;
  end if;

  insert into public.subscribers (
    full_name, email, phone, email_consent_at, whatsapp_consent_at, source_ip
  )
  values (
    p_full_name, p_email, p_phone, now(),
    case when p_whatsapp_consent then now() end,
    p_source_ip
  )
  on conflict (email) do nothing
  returning id into v_subscriber_id;

  if v_subscriber_id is null then
    select s.id, s.unsubscribed_at
    into v_subscriber_id, v_unsubscribed_at
    from public.subscribers s
    where s.email = p_email
    for update;

    if v_unsubscribed_at is not null then
      delete from public.subscriptions s where s.subscriber_id = v_subscriber_id;

      update public.subscribers s
      set full_name = p_full_name,
          phone = p_phone,
          email_consent_at = now(),
          whatsapp_consent_at = case when p_whatsapp_consent then now() end,
          unsubscribed_at = null,
          source_ip = p_source_ip
      where s.id = v_subscriber_id;
    else
      update public.subscribers s
      set full_name = p_full_name,
          phone = p_phone,
          whatsapp_consent_at = coalesce(
            s.whatsapp_consent_at,
            case when p_whatsapp_consent then now() end
          ),
          source_ip = p_source_ip
      where s.id = v_subscriber_id;
    end if;
  end if;

  -- בלי יעד ל-on conflict, כדי לכסות את שני האינדקסים החלקיים (כללי ולפרויקט)
  insert into public.subscriptions (subscriber_id, project_id)
  values (v_subscriber_id, p_project_id)
  on conflict do nothing;

  get diagnostics v_inserted = row_count;

  subscriber_id := v_subscriber_id;
  is_new_subscription := v_inserted > 0;
  return next;
end;
$$;

-- הרשאות: ברירת המחדל של Postgres נותנת EXECUTE ל-public
revoke execute on function public.check_rate_limit(text, integer, integer)
  from public, anon, authenticated;
revoke execute on function public.upsert_subscription(text, text, text, boolean, uuid, text)
  from public, anon, authenticated;

grant execute on function public.check_rate_limit(text, integer, integer)
  to service_role;
grant execute on function public.upsert_subscription(text, text, text, boolean, uuid, text)
  to service_role;
