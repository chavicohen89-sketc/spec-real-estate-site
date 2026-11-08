"use server";

import { updateTag } from "next/cache";
import { strings } from "@/lib/strings";
import {
  idListSchema,
  idSchema,
  imageAltSchema,
  isProjectImagePath,
  projectSchema,
  projectTitleSchema,
  type ProjectField,
} from "@/lib/validation/admin";
import { toFieldErrors } from "@/lib/validation/form-state";
import { NotAdminError, requireAdmin, type AdminDb } from "@/server/auth";
import { cacheTags } from "@/server/content";
import {
  addGalleryImage,
  createProject,
  deleteGalleryImage,
  deleteProject,
  publishProject,
  reorderGallery,
  reorderProjects,
  setCoverImage,
  unpublishProject,
  updateImageAlt,
  updateProject,
  type AdminGalleryImage,
} from "@/server/projects";

const common = strings.admin.common;
const editor = strings.admin.editor;

type Failure = {
  ok: false;
  error: string;
  fieldErrors?: Partial<Record<ProjectField, string>>;
};

export type ActionResult<T = object> = ({ ok: true } & T) | Failure;

const failure = (error: string = common.genericError): Failure => ({ ok: false, error });

/** כל Action עובר כאן: בדיקת is_admin, ותרגום שגיאות להודעה בעברית */
async function asAdmin<R>(run: (db: AdminDb) => Promise<R>): Promise<R | Failure> {
  try {
    return await run(await requireAdmin());
  } catch (error) {
    if (error instanceof NotAdminError) return failure(common.noPermission);
    console.error("admin action failed", error);
    return failure();
  }
}

function refreshProject(...slugs: (string | null | undefined)[]) {
  updateTag(cacheTags.projects);
  for (const slug of new Set(slugs)) {
    if (slug) updateTag(cacheTags.project(slug));
  }
}

export async function createProjectAction(
  rawTitle: string,
): Promise<ActionResult<{ id: string }>> {
  return asAdmin(async (db) => {
    const title = projectTitleSchema.safeParse(rawTitle);
    if (!title.success) return failure(title.error.issues[0].message);
    const id = await createProject(db, title.data);
    refreshProject();
    return { ok: true as const, id };
  });
}

export async function reorderProjectsAction(rawIds: string[]): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const ids = idListSchema.safeParse(rawIds);
    if (!ids.success) return failure();
    await reorderProjects(db, ids.data);
    refreshProject();
    return { ok: true as const };
  });
}

/** שמירה משותפת ל"שמור" ול"פרסם". מחזירה שגיאה, או את הכתובות לרענון */
async function save(
  db: AdminDb,
  id: string,
  raw: unknown,
): Promise<{ result: Failure } | { slugs: string[] }> {
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      result: {
        ok: false,
        error: parsed.error.issues[0].message,
        fieldErrors: toFieldErrors<ProjectField>(parsed.error),
      },
    };
  }

  const saved = await updateProject(db, id, parsed.data);
  if (saved.status === "slug_taken") {
    return {
      result: {
        ok: false,
        error: editor.errors.slugTaken,
        fieldErrors: { slug: editor.errors.slugTaken },
      },
    };
  }
  if (saved.status === "not_found") return { result: failure() };
  return { slugs: [saved.oldSlug, parsed.data.slug] };
}

export async function saveProjectAction(id: string, input: unknown): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const projectId = idSchema.parse(id);
    const saved = await save(db, projectId, input);
    if ("result" in saved) return saved.result;
    refreshProject(...saved.slugs);
    return { ok: true as const };
  });
}

export async function publishProjectAction(
  id: string,
  input: unknown,
  sendLaunchEmail: boolean,
): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const projectId = idSchema.parse(id);
    const saved = await save(db, projectId, input);
    if ("result" in saved) return saved.result;
    const published = await publishProject(db, projectId, sendLaunchEmail === true);
    refreshProject(...saved.slugs);
    if (!published) return failure(editor.coverRequired);
    return { ok: true as const };
  });
}

export async function unpublishProjectAction(id: string): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const slug = await unpublishProject(db, idSchema.parse(id));
    if (!slug) return failure();
    refreshProject(slug);
    return { ok: true as const };
  });
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const slug = await deleteProject(db, idSchema.parse(id));
    if (!slug) return failure();
    refreshProject(slug);
    return { ok: true as const };
  });
}

export async function setCoverImageAction(id: string, path: string): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const projectId = idSchema.parse(id);
    if (!isProjectImagePath(projectId, path)) return failure();
    const slug = await setCoverImage(db, projectId, path);
    if (!slug) return failure();
    refreshProject(slug);
    return { ok: true as const };
  });
}

export async function addGalleryImageAction(
  id: string,
  path: string,
): Promise<ActionResult<{ image: AdminGalleryImage }>> {
  return asAdmin(async (db) => {
    const projectId = idSchema.parse(id);
    if (!isProjectImagePath(projectId, path)) return failure();
    const added = await addGalleryImage(db, projectId, path);
    if (!added) return failure();
    refreshProject(added.slug);
    return { ok: true as const, image: added.image };
  });
}

export async function updateImageAltAction(
  id: string,
  imageId: string,
  rawAlt: string,
): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const alt = imageAltSchema.safeParse(rawAlt);
    if (!alt.success) return failure(alt.error.issues[0].message);
    const slug = await updateImageAlt(db, idSchema.parse(id), idSchema.parse(imageId), alt.data);
    refreshProject(slug);
    return { ok: true as const };
  });
}

export async function deleteGalleryImageAction(
  id: string,
  imageId: string,
): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const slug = await deleteGalleryImage(db, idSchema.parse(id), idSchema.parse(imageId));
    refreshProject(slug);
    return { ok: true as const };
  });
}

export async function reorderGalleryAction(
  id: string,
  rawIds: string[],
): Promise<ActionResult> {
  return asAdmin(async (db) => {
    const ids = idListSchema.safeParse(rawIds);
    if (!ids.success) return failure();
    const slug = await reorderGallery(db, idSchema.parse(id), ids.data);
    refreshProject(slug);
    return { ok: true as const };
  });
}
