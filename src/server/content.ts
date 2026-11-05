import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/lib/database.types";

/**
 * שליפות התוכן של האתר הציבורי, שמורות במטמון ומתויגות.
 * אחרי שמירה בממשק הניהול (שלב 5-6) מרעננים את התג המתאים,
 * והעמודים הציבוריים מתעדכנים מיד.
 */
export const cacheTags = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  siteContent: (key: string) => `site-content:${key}`,
} as const;

export type ProjectSummary = {
  id: string;
  title: string;
  slug: string;
  coverImagePath: string | null;
  updatedAt: string;
};

export type ProjectImage = {
  id: string;
  path: string;
  alt: string;
};

export type ProjectDetail = ProjectSummary & {
  body: Json | null;
  images: ProjectImage[];
};

export type SiteContent = {
  body: Json | null;
  imagePath: string | null;
};

/** פרויקטים מפורסמים, לפי הסדר שנקבע בממשק */
export async function getPublishedProjects(): Promise<ProjectSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.projects);

  const { data, error } = await createPublicClient()
    .from("projects")
    .select("id, title, slug, cover_image_path, updated_at")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`getPublishedProjects: ${error.message}`);

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    coverImagePath: p.cover_image_path,
    updatedAt: p.updated_at,
  }));
}

/** פרויקט מפורסם לפי כתובת. טיוטה או כתובת לא קיימת: null */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.projects, cacheTags.project(slug));

  const { data, error } = await createPublicClient()
    .from("projects")
    .select(
      "id, title, slug, body, cover_image_path, updated_at, project_images(id, image_path, alt, sort_order)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .order("sort_order", { referencedTable: "project_images", ascending: true })
    .maybeSingle();

  if (error) throw new Error(`getProjectBySlug: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    coverImagePath: data.cover_image_path,
    updatedAt: data.updated_at,
    images: data.project_images.map((img) => ({
      id: img.id,
      path: img.image_path,
      alt: img.alt,
    })),
  };
}

/** תוכן קבוע מ-site_content (למשל "about") */
export async function getSiteContent(key: string): Promise<SiteContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(cacheTags.siteContent(key));

  const { data, error } = await createPublicClient()
    .from("site_content")
    .select("body, image_path")
    .eq("key", key)
    .maybeSingle();

  if (error) throw new Error(`getSiteContent: ${error.message}`);
  if (!data) return null;
  return { body: data.body, imagePath: data.image_path };
}
