/** כתובת האתר המלאה, בלי / בסוף. ל-sitemap, robots ו-Open Graph. */
export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
