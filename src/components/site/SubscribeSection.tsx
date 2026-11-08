import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { Section } from "./Section";
import { SubscribeForm } from "./SubscribeForm";

type SubscribeSectionProps = {
  title: string;
  lead: string;
  /** פרויקט להרשמה. בלי: הרשמה כללית */
  projectId?: string;
};

export function SubscribeSection({ title, lead, projectId }: SubscribeSectionProps) {
  return (
    <Section divider id="subscribe">
      <Container size="narrow">
        <FadeIn>
          <h2 className="text-3xl font-light md:text-4xl">{title}</h2>
          <div className="mt-6 h-px w-16 bg-accent" />
          <p className="mt-6 leading-relaxed text-warm-gray">{lead}</p>
          <SubscribeForm projectId={projectId} />
        </FadeIn>
      </Container>
    </Section>
  );
}
