import { Container } from "./Container";
import { FadeIn } from "./FadeIn";

type PageHeaderProps = {
  title: string;
  lead?: string;
};

/** כותרת עמוד אחידה לעמודי התוכן (אודות, צור קשר, פרטיות) */
export function PageHeader({ title, lead }: PageHeaderProps) {
  return (
    <Container size="narrow" className="pt-16 md:pt-28">
      <FadeIn>
        <h1 className="text-4xl leading-tight font-light md:text-6xl">{title}</h1>
        <div className="mt-8 h-px w-16 bg-accent" />
        {lead && (
          <p className="mt-8 text-lg leading-relaxed text-warm-gray">{lead}</p>
        )}
      </FadeIn>
    </Container>
  );
}
