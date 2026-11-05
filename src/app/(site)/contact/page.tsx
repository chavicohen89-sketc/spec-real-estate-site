import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { FormPlaceholder } from "@/components/site/SubscribeSection";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.contact.title,
  description: strings.contact.description,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const t = strings.contact;
  const { contact } = siteConfig;

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <Section className="pt-12 md:pt-20">
        <Container className="grid gap-16 md:grid-cols-[1fr_2fr] md:gap-20">
          <FadeIn>
            <h2 className="text-xs font-sans tracking-[0.18em] text-warm-gray">
              {t.detailsTitle}
            </h2>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="text-sm text-warm-gray">{strings.footer.phone}</dt>
                <dd className="mt-1 text-lg">
                  <a href={contact.phoneHref} dir="ltr" className="hover:text-accent">
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-warm-gray">{strings.footer.email}</dt>
                <dd className="mt-1 text-lg">
                  <a href={`mailto:${contact.email}`} className="hover:text-accent">
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-warm-gray">{strings.footer.address}</dt>
                <dd className="mt-1 text-lg">{contact.address}</dd>
              </div>
            </dl>
          </FadeIn>
          <FadeIn>
            <h2 className="text-xs font-sans tracking-[0.18em] text-warm-gray">
              {t.formTitle}
            </h2>
            <FormPlaceholder />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
