import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@/server/content";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";

type ProjectCardProps = {
  project: ProjectSummary;
  /** מחרוזת sizes לפי הרשת שבה הכרטיס מוצג */
  sizes: string;
};

/** כרטיס פרויקט: תמונה ביחס 4:5 עם זום עדין במעבר עכבר, וכותרת מתחת */
export function ProjectCard({ project, sizes }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden bg-charcoal/5">
        {project.coverImagePath && (
          <Image
            src={imageUrl(project.coverImagePath)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover motion-safe:transition-transform motion-safe:duration-[1.2s] motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-charcoal/10 pb-4">
        <h3 className="text-2xl font-light md:text-3xl">{project.title}</h3>
        <span className="shrink-0 text-xs tracking-[0.18em] text-warm-gray transition-colors group-hover:text-accent">
          {strings.projectCard.details}
        </span>
      </div>
    </Link>
  );
}
