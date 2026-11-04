import Link from "next/link";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";
import { Container } from "./Container";

export function Footer() {
  const { contact } = siteConfig;

  return (
    <footer className="mt-auto border-t border-charcoal/10 py-14 md:py-20">
      <Container className="grid gap-10 md:grid-cols-2 md:items-end">
        <div>
          <p className="font-serif text-2xl">{siteConfig.name}</p>
          <h2 className="mt-6 text-xs font-sans tracking-[0.18em] text-warm-gray">
            {strings.footer.contactTitle}
          </h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="sr-only">{strings.footer.phone}</dt>
              <dd>
                <a href={contact.phoneHref} dir="ltr" className="hover:text-accent">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">{strings.footer.email}</dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="hover:text-accent">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">{strings.footer.address}</dt>
              <dd className="text-warm-gray">{contact.address}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-2 text-xs text-warm-gray md:items-end">
          <Link href={siteConfig.privacyHref} className="hover:text-accent">
            {strings.footer.privacy}
          </Link>
          <p>
            © {siteConfig.name}. {strings.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
