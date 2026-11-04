import Link from "next/link";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="border-b border-charcoal/10">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-cream focus:px-4 focus:py-2"
      >
        {strings.nav.skipToContent}
      </a>
      <Container className="flex h-20 items-center justify-between md:h-24">
        <Link
          href="/"
          className="relative z-50 font-serif text-xl tracking-wide md:text-2xl"
        >
          {siteConfig.name}
        </Link>

        <nav aria-label={strings.nav.mainLabel} className="hidden md:block">
          <ul className="flex items-center gap-10">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm tracking-[0.18em] transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu items={siteConfig.nav} />
      </Container>
    </header>
  );
}
