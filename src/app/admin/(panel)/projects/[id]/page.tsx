import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { idSchema } from "@/lib/validation/admin";
import { requireAdminPage } from "@/server/auth";
import { getProject } from "@/server/projects";

export default async function AdminProjectPage({
  params,
}: PageProps<"/admin/projects/[id]">) {
  const db = await requireAdminPage();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();

  const project = await getProject(db, id);
  if (!project) notFound();

  return <ProjectEditor key={project.id} project={project} />;
}
