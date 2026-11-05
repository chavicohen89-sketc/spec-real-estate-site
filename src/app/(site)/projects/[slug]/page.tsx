import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";
import { FadeIn } from "@/components/site/FadeIn";
import { Gallery } from "@/components/site/Gallery";
import { RichText } from "@/components/site/RichText";
import { Section } from "@/components/site/Section";
import { SubscribeSection } from "@/components/site/SubscribeSection";
import { renderRichText } from "@/lib/rich-text";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { getProjectBySlug, getPublishedProjects } from "@/server/content";

// העמוד כולו סטטי (נתונים מ-"use cache"). כתובת שלא נבנתה מראש (פרויקט שפורסם אחרי
// ה-build, טיוטה או כתובת שגויה) מחכה לרינדור מלא במקום לקבל App Shell עם סטטוס 200,
// ולכן notFound() מחזיר 404 אמיתי כבר בבקשה הראשונה.
export const ensureStatic = "navigation";

// עם Cache Components חובה להחזיר לפחות פרמטר אחד. בלי פרויקטים מפורסמים
// (למשל מסד ייצור ריק) מחזירים placeholder שמסתיים ב-notFound().
const NO_PROJECTS_PLACEHOLDER = "__none__";

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  if (projects.length === 0) return [{ slug: NO_PROJECTS_PLACEHOLDER }];
  return projects.map((p) => ({ slug: p.slug }));
}

/** תיאור קצר לשיתוף: תחילת הטקסט של הפרויקט, בלי HTML */
function excerpt(body: unknown, max = 160): string | undefined {
  const text = renderRichText(body)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: strings.notFound.metaTitle };

  const description = excerpt(project.body) ?? strings.meta.description;
  const images = project.coverImagePath
    ? [{ url: imageUrl(project.coverImagePath), alt: project.title }]
    : undefined;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description, images, type: "article" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const t = strings.project;
  const gallery = project.images.map((img) => ({
    id: img.id,
    src: imageUrl(img.path),
    alt: img.alt,
  }));

  return (
    <>
      {project.coverImagePath && (
        <div className="relative aspect-4/5 w-full sm:aspect-3/2 lg:aspect-auto lg:h-[80svh]">
          <Image
            src={imageUrl(project.coverImagePath)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      <Section className="pt-14 md:pt-20">
        <Container size="narrow">
          <FadeIn>
            <Link
              href="/#projects"
              className="text-xs tracking-[0.18em] text-warm-gray transition-colors hover:text-accent"
            >
              {t.backToAll}
            </Link>
            <h1 className="mt-6 text-4xl leading-tight font-light md:text-6xl">
              {project.title}
            </h1>
            <div className="mt-8 h-px w-16 bg-accent" />
          </FadeIn>
          <FadeIn>
            <RichText content={project.body} className="mt-10" />
          </FadeIn>
        </Container>
      </Section>

      {gallery.length > 0 && (
        <Section divider>
          <Container>
            <FadeIn>
              <h2 className="text-3xl font-light md:text-4xl">{t.galleryTitle}</h2>
            </FadeIn>
            <div className="mt-10 md:mt-14">
              <Gallery images={gallery} />
            </div>
          </Container>
        </Section>
      )}

      <SubscribeSection
        title={t.subscribeTitle(project.title)}
        lead={t.subscribeLead}
        projectId={project.id}
      />
    </>
  );
}
