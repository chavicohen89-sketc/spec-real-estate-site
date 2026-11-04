import { Button } from "@/components/site/Button";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { Section } from "@/components/site/Section";
import { strings } from "@/lib/strings";

// עמוד בית זמני (שלב 1): מציג את הטיפוגרפיה, הצבעים והכפתורים.

const swatches = [
  { className: "bg-cream border border-charcoal/10", label: strings.home.colors.cream },
  { className: "bg-charcoal", label: strings.home.colors.charcoal },
  { className: "bg-warm-gray", label: strings.home.colors.warmGray },
  { className: "bg-accent", label: strings.home.colors.accent },
];

export default function HomePage() {
  const t = strings.home;

  return (
    <>
      <Section className="pt-16 md:pt-28">
        <Container>
          <FadeIn>
            <p className="text-xs tracking-[0.25em] text-warm-gray">{t.eyebrow}</p>
            <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-light md:text-6xl">
              {t.title}
            </h1>
            <div className="mt-8 h-px w-16 bg-accent" />
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-warm-gray">
              {t.lead}
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Button href="/#projects">{t.primaryCta}</Button>
              <Button href="/contact" variant="secondary">
                {t.secondaryCta}
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section divider id="projects">
        <Container size="narrow">
          <FadeIn>
            <h2 className="text-xs font-sans tracking-[0.25em] text-warm-gray">
              {t.typographyTitle}
            </h2>
            <p className="mt-8 font-serif text-3xl md:text-5xl">{t.headingSample}</p>
            <p className="mt-6 font-serif text-xl md:text-2xl">{t.subheadingSample}</p>
            <p className="mt-6 text-base leading-loose md:text-lg">{t.bodySample}</p>
            <p className="mt-4 text-sm text-warm-gray">{t.mutedSample}</p>
          </FadeIn>
        </Container>
      </Section>

      <Section divider>
        <Container>
          <FadeIn>
            <h2 className="text-xs font-sans tracking-[0.25em] text-warm-gray">
              {t.colorsTitle}
            </h2>
          </FadeIn>
          <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {swatches.map((s, i) => (
              <li key={s.label}>
                <FadeIn delay={i * 100}>
                  <div className={`aspect-4/5 ${s.className}`} />
                  <p className="mt-3 text-sm">{s.label}</p>
                </FadeIn>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section divider>
        <Container>
          <FadeIn>
            <h2 className="text-xs font-sans tracking-[0.25em] text-warm-gray">
              {t.buttonsTitle}
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button>{t.primaryCta}</Button>
              <Button variant="secondary">{t.secondaryCta}</Button>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
