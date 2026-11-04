import { strings } from "@/lib/strings";

/**
 * פרטי היזם, תפריט ופרטי קשר.
 * TODO לפני עלייה לאוויר: טלפון, אימייל וכתובת אמיתיים (ראו "פתוח" באפיון).
 */
export const siteConfig = {
  name: "חוי כהן",
  contact: {
    phone: "03-0000000",
    phoneHref: "tel:+97230000000",
    email: "info@example.com",
    address: "כתובת המשרד תעודכן בהמשך",
  },
  nav: [
    { href: "/#projects", label: strings.nav.projects },
    { href: "/about", label: strings.nav.about },
    { href: "/contact", label: strings.nav.contact },
  ],
  privacyHref: "/privacy",
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
