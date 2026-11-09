import { AboutEditor } from "@/components/admin/AboutEditor";
import { getAbout } from "@/server/about";
import { requireAdminPage } from "@/server/auth";

export default async function AdminAboutPage() {
  const db = await requireAdminPage();
  const about = await getAbout(db);
  return <AboutEditor about={about} />;
}
