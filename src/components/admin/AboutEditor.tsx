"use client";

import type { JSONContent } from "@tiptap/core";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAboutAction, setAboutImageAction } from "@/app/admin/(panel)/about/actions";
import { Button } from "@/components/admin/ui/button";
import { strings } from "@/lib/strings";
import type { AdminAbout } from "@/server/about";
import { ImagePicker } from "./ImagePicker";
import { RichTextEditor } from "./RichTextEditor";

const t = strings.admin.about;

export function AboutEditor({ about }: { about: AdminAbout }) {
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState<JSONContent | null>(about.body as JSONContent | null);
  const [imagePath, setImagePath] = useState(about.imagePath);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function save() {
    startTransition(async () => {
      const result = await saveAboutAction(body);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDirty(false);
      toast.success(t.saved);
    });
  }

  function removeImage() {
    startTransition(async () => {
      const result = await setAboutImageAction(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setImagePath(null);
      toast.success(t.imageRemoved);
    });
  }

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl">{t.title}</h1>

      <div className="grid gap-2">
        <span id="about-body-label" className="text-sm font-medium">
          {t.body}
        </span>
        <RichTextEditor
          labelId="about-body-label"
          value={body}
          onChange={(value) => {
            setBody(value);
            setDirty(true);
          }}
        />
      </div>

      <div className="grid justify-items-start gap-3">
        <ImagePicker
          folder="about"
          path={imagePath}
          labels={{ heading: t.image, empty: t.imageEmpty, upload: t.imageUpload, replace: t.imageReplace }}
          save={setAboutImageAction}
          onChange={setImagePath}
        />
        {imagePath && (
          <Button type="button" variant="ghost" disabled={pending} onClick={removeImage}>
            {t.imageRemove}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="button" disabled={pending} onClick={save}>
          {pending ? t.saving : t.save}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/about" target="_blank">
            {t.viewOnSite}
          </Link>
        </Button>
      </div>
    </div>
  );
}
