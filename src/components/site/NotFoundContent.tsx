import { strings } from "@/lib/strings";
import { Button } from "./Button";
import { Container } from "./Container";

/** תוכן עמוד 404, משותף ל-not-found הגלובלי ולזה של (site) */
export function NotFoundContent() {
  const t = strings.notFound;
  return (
    <div className="flex flex-1 items-center py-24 md:py-40">
      <Container size="narrow">
        <p className="font-serif text-7xl font-light text-accent md:text-9xl">{t.code}</p>
        <h1 className="mt-8 text-3xl font-light md:text-5xl">{t.title}</h1>
        <div className="mt-8 h-px w-16 bg-accent" />
        <p className="mt-8 text-lg text-warm-gray">{t.lead}</p>
        <div className="mt-12">
          <Button href="/">{t.home}</Button>
        </div>
      </Container>
    </div>
  );
}
