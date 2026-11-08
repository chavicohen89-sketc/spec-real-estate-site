import Link from "next/link";
import { logoutAction } from "@/app/admin/(auth)/actions";
import { Button } from "@/components/admin/ui/button";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";

const t = strings.admin.shell;

export function AdminHeader({ showNav }: { showNav: boolean }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="font-serif text-lg">{siteConfig.name}</span>
        {showNav && (
          <nav aria-label={t.navLabel} className="flex gap-4 text-sm">
            <Link href="/admin/projects" className="hover:underline">
              {t.projects}
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
