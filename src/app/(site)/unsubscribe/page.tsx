import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/site/Button";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { UnsubscribeForm } from "@/components/site/UnsubscribeForm";
import { strings } from "@/lib/strings";
import { unsubscribeTokenSchema } from "@/lib/validation/unsubscribe";

export const metadata: Metadata = {
  title: strings.unsubscribe.title,
  description: strings.unsubscribe.description,
  robots: { index: false, follow: false },
  // הטוקן בכתובת לא נשלח לאתרים אחרים. לא "no-referrer": איתו הדפדפן שולח
  // Origin: null בשליחת טופס, ו-Next חוסם את ה-Server Action
  referrer: "same-origin",
};

async function UnsubscribeContent({
  searchParams,
}: Pick<PageProps<"/unsubscribe">, "searchParams">) {
  const t = strings.unsubscribe;
  const { token } = await searchParams;
  const parsed = unsubscribeTokenSchema.safeParse(token);

  if (!parsed.success) {
    return (
      <>
        <p className="leading-relaxed text-warm-gray">{t.invalidLink}</p>
        <div className="mt-8">
          <Button href="/" variant="secondary">
            {t.home}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-8 leading-relaxed text-warm-gray">{t.lead}</p>
      <UnsubscribeForm token={parsed.data} />
    </>
  );
}

export default function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  return (
    <>
      <PageHeader title={strings.unsubscribe.title} />
      <Section className="pt-10 md:pt-14">
        <Container size="narrow">
          <FadeIn>
            <Suspense>
              <UnsubscribeContent searchParams={searchParams} />
            </Suspense>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
