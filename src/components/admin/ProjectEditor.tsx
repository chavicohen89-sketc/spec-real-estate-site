"use client";

import type { JSONContent } from "@tiptap/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteProjectAction,
  publishProjectAction,
  saveProjectAction,
  setCoverImageAction,
  unpublishProjectAction,
} from "@/app/admin/(panel)/projects/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/admin/ui/alert-dialog";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { slugify } from "@/lib/slug";
import { strings } from "@/lib/strings";
import type { ProjectField } from "@/lib/validation/admin";
import type { AdminProject } from "@/server/projects";
import { GalleryManager } from "./GalleryManager";
import { ImagePicker } from "./ImagePicker";
import { RichTextEditor } from "./RichTextEditor";

const t = strings.admin.editor;

export function ProjectEditor({ project }: { project: AdminProject }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [body, setBody] = useState<JSONContent | null>(project.body as JSONContent | null);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProjectField, string>>>({});

  const [status, setStatus] = useState(project.status);
  const [publishedAt, setPublishedAt] = useState(project.publishedAt);
  const [savedSlug, setSavedSlug] = useState(project.slug);
  const [coverPath, setCoverPath] = useState(project.coverImagePath);
  const [sendEmail, setSendEmail] = useState(true);

  // הכתובת עוקבת אחרי השם עד עריכה ידנית או פרסום ראשון
  const [slugIsAuto, setSlugIsAuto] = useState(
    !project.publishedAt && project.slug === slugify(project.title),
  );

  const published = status === "published";
  const everPublished = publishedAt !== null;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function onTitleChange(value: string) {
    setTitle(value);
    setDirty(true);
    if (slugIsAuto) setSlug(slugify(value));
  }

  /** מריץ פעולת שמירה ומעדכן את המסך לפי התוצאה */
  function persist(
    action: () => ReturnType<typeof publishProjectAction>,
    message: string,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setFieldErrors({});
      setDirty(false);
      setSavedSlug(slug);
      onSuccess?.();
      if (result.warning) toast.warning(result.warning);
      else toast.success(message);
    });
  }

  const input = { title, slug, body };

  const save = () => persist(() => saveProjectAction(project.id, input), t.saved);

  function publish(email: boolean) {
    persist(() => publishProjectAction(project.id, input, email), t.published, () => {
      setStatus("published");
      setPublishedAt((current) => current ?? new Date().toISOString());
      setSlugIsAuto(false);
    });
  }

  const unpublish = () =>
    persist(() => unpublishProjectAction(project.id), t.unpublished, () => setStatus("draft"));

  function remove() {
    startTransition(async () => {
      const result = await deleteProjectAction(project.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDirty(false);
      toast.success(t.deleted);
      router.push("/admin/projects");
    });
  }

  const publishButton = coverPath ? (
    everPublished ? (
      <Button type="button" disabled={pending} onClick={() => publish(false)}>
        {t.publish}
      </Button>
    ) : (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" disabled={pending}>
            {t.publish}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.publishDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.publishDialogBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3">
            <Checkbox
              id="send-launch-email"
              checked={sendEmail}
              onCheckedChange={(value) => setSendEmail(value === true)}
            />
            <Label htmlFor="send-launch-email">{t.publishDialogEmail}</Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.admin.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => publish(sendEmail)}>{t.publishConfirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  ) : (
    <Button type="button" onClick={() => toast.error(t.coverRequired)}>
      {t.publish}
    </Button>
  );

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/admin/projects" className="text-sm text-muted-foreground underline">
          {t.backToList}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 text-2xl break-words">{title || project.title}</h1>
          <Badge variant={published ? "default" : "outline"}>
            {published ? strings.admin.projects.statusPublished : strings.admin.projects.statusDraft}
          </Badge>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project-title">{t.fieldTitle}</Label>
        <Input
          id="project-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-invalid={fieldErrors.title ? true : undefined}
        />
        {fieldErrors.title && <p className="text-sm">{fieldErrors.title}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project-slug">{t.fieldSlug}</Label>
        <Input
          id="project-slug"
          dir="ltr"
          className="text-start"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugIsAuto(false);
            setDirty(true);
          }}
          aria-invalid={fieldErrors.slug ? true : undefined}
        />
        <p className="text-sm text-muted-foreground">{t.slugHint}</p>
        {fieldErrors.slug && <p className="text-sm">{fieldErrors.slug}</p>}
        {published && slug !== savedSlug && <p className="text-sm">{t.slugChangeWarning}</p>}
      </div>

      <div className="grid gap-2">
        <span id="project-body-label" className="text-sm font-medium">
          {t.fieldBody}
        </span>
        <RichTextEditor
          labelId="project-body-label"
          value={body}
          onChange={(value) => {
            setBody(value);
            setDirty(true);
          }}
        />
        {fieldErrors.body && <p className="text-sm">{fieldErrors.body}</p>}
      </div>

      <ImagePicker
        folder={`projects/${project.id}`}
        path={coverPath}
        labels={{ heading: t.cover, empty: t.coverEmpty, upload: t.coverUpload, replace: t.coverReplace }}
        save={(path) => setCoverImageAction(project.id, path)}
        onChange={setCoverPath}
      />
      <GalleryManager projectId={project.id} initialImages={project.images} />

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="button" variant="outline" disabled={pending} onClick={save}>
          {pending ? t.saving : published ? t.saveChanges : t.saveDraft}
        </Button>
        {published ? (
          <>
            <Button type="button" variant="outline" disabled={pending} onClick={unpublish}>
              {t.unpublish}
            </Button>
            <Button asChild variant="ghost">
              <Link href={`/projects/${savedSlug}`} target="_blank">
                {t.viewOnSite}
              </Link>
            </Button>
          </>
        ) : (
          publishButton
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" className="ms-auto" disabled={pending}>
              {t.deleteProject}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteDialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.deleteDialogBody}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{strings.admin.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>{t.deleteConfirm}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
