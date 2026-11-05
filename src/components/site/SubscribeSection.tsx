import { strings } from "@/lib/strings";
import { Container } from "./Container";
import { FadeIn } from "./FadeIn";
import { Section } from "./Section";

type SubscribeSectionProps = {
  title: string;
  lead: string;
  /** פרויקט להרשמה. בלי: הרשמה כללית. ישמש את הטופס בשלב 4 */
  projectId?: string;
};

/**
 * סקשן הרשמה לעדכונים. בשלב 3 יש כאן רק מקום שמור;
 * בשלב 4 נכנס במקומו SubscribeForm עם אותו projectId.
 */
export function SubscribeSection({ title, lead, projectId }: SubscribeSectionProps) {
  return (
    <Section divider id="subscribe">
      <Container size="narrow">
        <FadeIn>
          <h2 className="text-3xl font-light md:text-4xl">{title}</h2>
          <div className="mt-6 h-px w-16 bg-accent" />
          <p className="mt-6 leading-relaxed text-warm-gray">{lead}</p>
          <FormPlaceholder projectId={projectId} />
        </FadeIn>
      </Container>
    </Section>
  );
}

export function FormPlaceholder({ projectId }: { projectId?: string }) {
  return (
    <div
      data-project-id={projectId}
      className="mt-10 flex min-h-48 items-center justify-center border border-dashed border-charcoal/20 text-sm text-warm-gray"
    >
      {strings.formPlaceholder}
    </div>
  );
}
