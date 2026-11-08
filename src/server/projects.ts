import "server-only";
import type { Json } from "@/lib/database.types";
import { IMAGES_BUCKET } from "@/lib/storage";
import { slugify } from "@/lib/slug";
import type { ProjectInput } from "@/lib/validation/admin";
import type { AdminDb } from "@/server/auth";

/**
 * לוגיקת ניהול הפרויקטים. כל הפונקציות מקבלות לקוח של המנהל המחובר,
 * כך שגם RLS חל. מי שקורא להן בודק קודם הרשאה (requireAdmin).
 */

const UNIQUE_VIOLATION = "23505";

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  coverImagePath: string | null;
};

export async function listProjects(db: AdminDb): Promise<AdminProjectRow[]> {
  const { data, error } = await db
    .from("projects")
    .select("id, title, slug, status, cover_image_path")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listProjects: ${error.message}`);
  return data.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    coverImagePath: p.cover_image_path,
  }));
}

export type AdminGalleryImage = { id: string; path: string; alt: string };

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  body: Json | null;
  status: string;
  coverImagePath: string | null;
  publishedAt: string | null;
  images: AdminGalleryImage[];
};

export async function getProject(db: AdminDb, id: string): Promise<AdminProject | null> {
  const { data, error } = await db
    .from("projects")
    .select(
      "id, title, slug, body, status, cover_image_path, published_at, project_images(id, image_path, alt, sort_order)",
    )
    .eq("id", id)
    .order("sort_order", { referencedTable: "project_images", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`getProject: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    status: data.status,
    coverImagePath: data.cover_image_path,
    publishedAt: data.published_at,
    images: data.project_images.map((i) => ({ id: i.id, path: i.image_path, alt: i.alt })),
  };
}

/** טיוטה חדשה בסוף הרשימה, עם כתובת פנויה שנגזרת מהשם */
export async function createProject(db: AdminDb, title: string): Promise<string> {
  const base = slugify(title) || "project";

  const { data: last, error: lastError } = await db
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) throw new Error(`createProject: ${lastError.message}`);
  const sortOrder = (last?.sort_order ?? 0) + 1;

  for (let attempt = 1; attempt <= 50; attempt++) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    const { data, error } = await db
      .from("projects")
      .insert({ title, slug, sort_order: sortOrder })
      .select("id")
      .single();
    if (!error) return data.id;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(`createProject: ${error.message}`);
  }
  throw new Error("createProject: no free slug");
}

type SaveResult = { status: "ok"; oldSlug: string } | { status: "slug_taken" } | { status: "not_found" };

export async function updateProject(
  db: AdminDb,
  id: string,
  input: ProjectInput,
): Promise<SaveResult> {
  const { data: current, error: readError } = await db
    .from("projects")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`updateProject: ${readError.message}`);
  if (!current) return { status: "not_found" };

  const { error } = await db
    .from("projects")
    .update({ title: input.title, slug: input.slug, body: input.body as Json })
    .eq("id", id);
  if (error?.code === UNIQUE_VIOLATION) return { status: "slug_taken" };
  if (error) throw new Error(`updateProject: ${error.message}`);
  return { status: "ok", oldSlug: current.slug };
}

/** false: אין תמונה ראשית או שהפרויקט לא קיים (נאכף ב-SQL) */
export async function publishProject(
  db: AdminDb,
  id: string,
  sendLaunchEmail: boolean,
): Promise<boolean> {
  const { data, error } = await db.rpc("publish_project", {
    p_id: id,
    p_send_launch_email: sendLaunchEmail,
  });
  if (error) throw new Error(`publishProject: ${error.message}`);
  return data;
}

export async function unpublishProject(db: AdminDb, id: string): Promise<string | null> {
  const { data, error } = await db
    .from("projects")
    .update({ status: "draft" })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error) throw new Error(`unpublishProject: ${error.message}`);
  return data?.slug ?? null;
}

export async function reorderProjects(db: AdminDb, ids: string[]): Promise<void> {
  const { error } = await db.rpc("reorder_projects", { p_ids: ids });
  if (error) throw new Error(`reorderProjects: ${error.message}`);
}

async function removeFiles(db: AdminDb, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await db.storage.from(IMAGES_BUCKET).remove(paths);
  // הנתונים כבר נמחקו; קובץ יתום לא צריך להפיל את הפעולה
  if (error) console.error("storage remove failed", error.message);
}

async function slugOf(db: AdminDb, id: string): Promise<string | null> {
  const { data, error } = await db.from("projects").select("slug").eq("id", id).maybeSingle();
  if (error) throw new Error(`slugOf: ${error.message}`);
  return data?.slug ?? null;
}

/** קובע תמונה ראשית ומוחק את הקובץ הקודם. מחזיר את כתובת הפרויקט */
export async function setCoverImage(
  db: AdminDb,
  id: string,
  path: string,
): Promise<string | null> {
  const { data: current, error: readError } = await db
    .from("projects")
    .select("slug, cover_image_path")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw new Error(`setCoverImage: ${readError.message}`);
  if (!current) return null;

  const { error } = await db.from("projects").update({ cover_image_path: path }).eq("id", id);
  if (error) throw new Error(`setCoverImage: ${error.message}`);

  if (current.cover_image_path && current.cover_image_path !== path) {
    await removeFiles(db, [current.cover_image_path]);
  }
  return current.slug;
}

export async function addGalleryImage(
  db: AdminDb,
  projectId: string,
  path: string,
): Promise<{ image: AdminGalleryImage; slug: string } | null> {
  const slug = await slugOf(db, projectId);
  if (!slug) return null;

  const { data: last, error: lastError } = await db
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) throw new Error(`addGalleryImage: ${lastError.message}`);

  const { data, error } = await db
    .from("project_images")
    .insert({
      project_id: projectId,
      image_path: path,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id, image_path, alt")
    .single();
  if (error) throw new Error(`addGalleryImage: ${error.message}`);
  return { image: { id: data.id, path: data.image_path, alt: data.alt }, slug };
}

export async function updateImageAlt(
  db: AdminDb,
  projectId: string,
  imageId: string,
  alt: string,
): Promise<string | null> {
  const { error } = await db
    .from("project_images")
    .update({ alt })
    .eq("id", imageId)
    .eq("project_id", projectId);
  if (error) throw new Error(`updateImageAlt: ${error.message}`);
  return slugOf(db, projectId);
}

export async function deleteGalleryImage(
  db: AdminDb,
  projectId: string,
  imageId: string,
): Promise<string | null> {
  const { data, error } = await db
    .from("project_images")
    .delete()
    .eq("id", imageId)
    .eq("project_id", projectId)
    .select("image_path")
    .maybeSingle();
  if (error) throw new Error(`deleteGalleryImage: ${error.message}`);
  if (data) await removeFiles(db, [data.image_path]);
  return slugOf(db, projectId);
}

export async function reorderGallery(
  db: AdminDb,
  projectId: string,
  ids: string[],
): Promise<string | null> {
  const { error } = await db.rpc("reorder_project_images", {
    p_project_id: projectId,
    p_ids: ids,
  });
  if (error) throw new Error(`reorderGallery: ${error.message}`);
  return slugOf(db, projectId);
}

/** מוחק את הפרויקט ואת כל הקבצים שלו. מחזיר את הכתובת שהייתה לו */
export async function deleteProject(db: AdminDb, id: string): Promise<string | null> {
  const project = await getProject(db, id);
  if (!project) return null;

  // גם קבצים בתיקיית הפרויקט שלא קושרו לשורה (למשל העלאה שנקטעה)
  const folder = `projects/${id}`;
  const { data: listed, error: listError } = await db.storage
    .from(IMAGES_BUCKET)
    .list(folder, { limit: 1000 });
  if (listError) console.error("storage list failed", listError.message);

  const paths = new Set(project.images.map((i) => i.path));
  if (project.coverImagePath) paths.add(project.coverImagePath);
  for (const file of listed ?? []) paths.add(`${folder}/${file.name}`);

  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) throw new Error(`deleteProject: ${error.message}`);

  await removeFiles(db, [...paths]);
  return project.slug;
}
