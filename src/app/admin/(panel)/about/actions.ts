"use server";

import { updateTag } from "next/cache";
import type { Json } from "@/lib/database.types";
import { aboutBodySchema, isAboutImagePath } from "@/lib/validation/admin";
import { saveAboutBody, setAboutImage } from "@/server/about";
import { asAdmin, failure, type ActionFailure } from "@/server/admin-action";
import { cacheTags } from "@/server/content";

type Result = { ok: true } | ActionFailure;

const refreshAbout = () => updateTag(cacheTags.siteContent("about"));

export async function saveAboutAction(rawBody: unknown): Promise<Result> {
  return asAdmin(async (db) => {
    const body = aboutBodySchema.safeParse(rawBody);
    if (!body.success) return failure(body.error.issues[0].message);
    await saveAboutBody(db, body.data as Json | null);
    refreshAbout();
    return { ok: true as const };
  });
}

export async function setAboutImageAction(path: string | null): Promise<Result> {
  return asAdmin(async (db) => {
    if (path !== null && !isAboutImagePath(path)) return failure();
    await setAboutImage(db, path);
    refreshAbout();
    return { ok: true as const };
  });
}
