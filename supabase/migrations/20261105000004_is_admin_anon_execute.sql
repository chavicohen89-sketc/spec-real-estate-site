-- תיקון: מדיניות הקריאה הציבורית של projects ו-project_images קוראת ל-is_admin(),
-- ולכן anon חייב הרשאת EXECUTE. בלעדיה כל שאילתה של גולש נכשלת ב-permission denied.
-- זה בטוח: עבור anon, auth.uid() הוא null והפונקציה מחזירה false.

grant execute on function public.is_admin() to anon;
