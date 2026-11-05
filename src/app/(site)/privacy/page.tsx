import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.privacy.title,
  description: strings.privacy.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  const t = strings.privacy;

  return (
    <>
      <PageHeader title={t.title} />
      <Section className="pt-12 md:pt-16">
        <Container size="narrow">
          {/* TODO לפני עלייה לאוויר: להחליף בנוסח מאושר ולהסיר את ההודעה */}
          <p role="note" className="border-s-2 border-accent bg-accent/10 px-5 py-4 text-sm leading-relaxed">
            {t.placeholderNotice}
          </p>
          <p className="mt-10 text-sm text-warm-gray">{t.updated}</p>
          <div className="mt-10 space-y-10">
            {t.sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-2xl font-light">{s.title}</h2>
                <p className="mt-4 leading-loose">{s.body}</p>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
