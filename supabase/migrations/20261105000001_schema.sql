-- סכמה בסיסית: 8 הטבלאות מהאפיון, ועוד rate_limits ו-campaign_recipients.
-- סטטוסים נשמרים כ-text עם check (לא enum), כדי שיהיה קל להרחיב.

-- updated_at אוטומטי ------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- פרויקטים ----------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  body jsonb,                                   -- מסמך Tiptap (JSON)
  cover_image_path text,                        -- נתיב בתוך bucket images
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  published_at timestamptz,
  launch_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_status_sort_idx on public.projects (status, sort_order);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_path text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_images_project_sort_idx
  on public.project_images (project_id, sort_order);

-- נרשמים והרשמות ----------------------------------------------------------

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) > 0),
  -- נשמר תמיד באותיות קטנות; מייל עם אותיות גדולות נכשל במקום לחמוק
  email text not null unique check (email = lower(email)),
  phone text not null check (phone ~ '^\+972[0-9]{8,9}$'),
  email_consent_at timestamptz not null,
  whatsapp_consent_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  unsubscribed_at timestamptz,
  source_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscribers_set_updated_at
  before update on public.subscribers
  for each row execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade, -- null = הרשמה כללית
  created_at timestamptz not null default now()
);

-- ב-Postgres שני NULL לא שווים, ולכן ייחודיות נפרדת להרשמה כללית
create unique index subscriptions_project_unique
  on public.subscriptions (subscriber_id, project_id)
  where project_id is not null;

create unique index subscriptions_general_unique
  on public.subscriptions (subscriber_id)
  where project_id is null;

create index subscriptions_project_idx on public.subscriptions (project_id);

-- דיוור -------------------------------------------------------------------

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('manual', 'auto')),
  subject text not null,
  body jsonb,
  audience text not null check (audience in ('all', 'general', 'project')),
  project_id uuid references public.projects (id) on delete set null,
  recipients_count integer not null default 0,
  sent_at timestamptz,
  sent_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index campaigns_created_idx on public.campaigns (created_at desc);

create table public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  resend_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, subscriber_id)
);

create index campaign_recipients_status_idx
  on public.campaign_recipients (campaign_id, status);

create trigger campaign_recipients_set_updated_at
  before update on public.campaign_recipients
  for each row execute function public.set_updated_at();

-- הודעות צור קשר ----------------------------------------------------------

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  handled boolean not null default false,
  source_ip text,
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- תוכן האתר ---------------------------------------------------------------

create table public.site_content (
  key text primary key,                         -- למשל 'about'
  body jsonb,
  image_path text,
  updated_at timestamptz not null default now()
);

create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- תפקידי מנהלים -----------------------------------------------------------

create table public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- הגבלת קצב ---------------------------------------------------------------

create table public.rate_limits (
  key text not null,                            -- למשל 'subscribe:1.2.3.4'
  window_start timestamptz not null,
  count integer not null default 0,
  primary key (key, window_start)
);
