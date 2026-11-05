import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { PageHeader } from "@/components/site/PageHeader";
import { RichText } from "@/components/site/RichText";
import { Section } from "@/components/site/Section";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { getSiteContent } from "@/server/content";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getSiteContent("about");
  return {
    title: strings.about.title,
    description: strings.about.description,
    alternates: { canonical: "/about" },
    openGraph: about?.imagePath
      ? { images: [{ url: imageUrl(about.imagePath) }] }
      : undefined,
  };
}

export default async function AboutPage() {
  const about = await getSiteContent("about");

  return (
    <>
      <PageHeader title={strings.about.title} />
      <Section className="pt-12 md:pt-16">
        {about?.imagePath && (
          <Container className="mb-14 md:mb-20">
            <FadeIn>
              <div className="relative aspect-3/2 w-full overflow-hidden bg-charcoal/5">
                <Image
                  src={imageUrl(about.imagePath)}
                  alt=""
                  fill
                  sizes="(min-width: 1152px) 1088px, 100vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </Container>
        )}
        <Container size="narrow">
          <FadeIn>
            <RichText content={about?.body} />
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
