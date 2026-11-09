import { CampaignComposer } from "@/components/admin/CampaignComposer";
import { requireAdminPage } from "@/server/auth";
import { listProjects } from "@/server/projects";

export default async function AdminEmailPage() {
  const db = await requireAdminPage();
  const projects = await listProjects(db);
  return <CampaignComposer projects={projects.map((p) => ({ id: p.id, title: p.title }))} />;
}
