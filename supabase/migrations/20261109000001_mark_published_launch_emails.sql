-- פרויקטים שפורסמו לפני שמערכת המיילים הייתה קיימת, עם אישור למייל שלא נשלח.
-- בלי הסימון הזה, החזרה לטיוטה ופרסום חוזר היו שולחים מייל "פרויקט חדש" באיחור.
update public.projects
set launch_email_sent_at = published_at
where published_at is not null
  and launch_email_requested
  and launch_email_sent_at is null;
