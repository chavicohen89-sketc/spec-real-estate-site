import { NewProjectDialog } from "@/components/admin/NewProjectDialog";
import { ProjectsList } from "@/components/admin/ProjectsList";
import { strings } from "@/lib/strings";
import { requireAdminPage } from "@/server/auth";
import { listProjects } from "@/server/projects";

const t = strings.admin.projects;

export default async function AdminProjectsPage() {
  const db = await requireAdminPage();
  const projects = await listProjects(db);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl">{t.title}</h1>
        <NewProjectDialog />
      </div>
      {/* key: נתונים חדשים מהשרת מאפסים את הסדר המקומי של הגרירה */}
      <ProjectsList key={JSON.stringify(projects)} initialProjects={projects} />
    </>
  );
}
