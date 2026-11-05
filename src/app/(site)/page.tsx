import Image from "next/image";
import { Button } from "@/components/site/Button";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Section } from "@/components/site/Section";
import { SubscribeSection } from "@/components/site/SubscribeSection";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { getPublishedProjects } from "@/server/content";

export default async function HomePage() {
  const t = strings.home;
  const projects = await getPublishedProjects();
  // תמונת ה-Hero: התמונה הראשית של הפרויקט הראשון לפי הסדר שנקבע בניהול
  const heroPath = projects.find((p) => p.coverImagePath)?.coverImagePath;

  return (
    <>
      <section className="relative">
        {heroPath && (
          <div className="relative h-[70svh] min-h-96 w-full md:h-[85svh]">
            <Image
              src={imageUrl(heroPath)}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
          </div>
        )}
        <div
          className={
            heroPath ? "absolute inset-x-0 bottom-0 pb-12 text-cream md:pb-20" : "pt-16 md:pt-28"
          }
        >
          <Container>
            <FadeIn>
              <p className={`text-xs tracking-[0.25em] ${heroPath ? "text-cream/85" : "text-warm-gray"}`}>
                {t.eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-light md:text-6xl">
                {t.title}
              </h1>
              <div className="mt-8 h-px w-16 bg-accent" />
            </FadeIn>
          </Container>
        </div>
      </section>

      <Section>
        <Container size="narrow">
          <FadeIn>
            <p className="text-lg leading-relaxed md:text-xl">{t.lead}</p>
            <div className="mt-10">
              <Button href="/#projects" variant="secondary">
                {t.cta}
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section divider id="projects" className="scroll-mt-4">
        <Container>
          <FadeIn>
            <h2 className="text-3xl font-light md:text-5xl">{t.projectsTitle}</h2>
          </FadeIn>
          {projects.length === 0 ? (
            <p className="mt-10 text-warm-gray">{t.noProjects}</p>
          ) : (
            <ul className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
              {projects.map((project, i) => (
                <li key={project.id}>
                  <FadeIn delay={(i % 3) * 120}>
                    <ProjectCard
                      project={project}
                      sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                    />
                  </FadeIn>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <SubscribeSection title={t.subscribeTitle} lead={t.subscribeLead} />
    </>
  );
}
