import Link from "next/link";
import { logoutAction } from "@/app/admin/(auth)/actions";
import { Button } from "@/components/admin/ui/button";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";

const t = strings.admin.shell;

const NAV_LINK = "hover:underline";

type Props = {
  showNav: boolean;
  unhandledMessages?: number;
};

export function AdminHeader({ showNav, unhandledMessages = 0 }: Props) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="font-serif text-lg">{siteConfig.name}</span>
        {showNav && (
          <nav aria-label={t.navLabel} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <Link href="/admin/projects" className={NAV_LINK}>
              {t.projects}
            </Link>
            <Link href="/admin/subscribers" className={NAV_LINK}>
              {t.subscribers}
            </Link>
            <Link href="/admin/messages" className={`${NAV_LINK} inline-flex items-center gap-1.5`}>
              {t.messages}
              {unhandledMessages > 0 && (
                <span
                  aria-label={t.unhandledCount(unhandledMessages)}
                  data-testid="unhandled-count"
                  className="rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground"
                >
                  {unhandledMessages}
                </span>
              )}
            </Link>
            <Link href="/admin/about" className={NAV_LINK}>
              {t.about}
            </Link>
            <Link href="/admin/email" className={NAV_LINK}>
              {t.email}
            </Link>
            <Link href="/admin/email/history" className={NAV_LINK}>
              {t.emailHistory}
            </Link>
          </nav>
        )}
        <div className="ms-auto flex items-center gap-2">
          {showNav && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                {t.viewSite}
              </Link>
            </Button>
          )}
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              {t.logout}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
