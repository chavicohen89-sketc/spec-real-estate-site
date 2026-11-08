"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { setCoverImageAction } from "@/app/admin/(panel)/projects/actions";
import { Button } from "@/components/admin/ui/button";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { removeUploadedImage, uploadProjectImage } from "./upload-image";

const t = strings.admin.editor;

type Props = {
  projectId: string;
  path: string | null;
  onChange: (path: string) => void;
};

export function CoverImagePicker({ projectId, path, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    let uploaded: string | null = null;
    try {
      uploaded = await uploadProjectImage(projectId, file);
      const result = await setCoverImageAction(projectId, uploaded);
      if (!result.ok) {
        await removeUploadedImage(uploaded);
        toast.error(result.error);
        return;
      }
      onChange(uploaded);
      toast.success(t.imageSaved);
    } catch (error) {
      console.error("cover upload failed", error);
      toast.error(t.imageFailed(file.name));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby="cover-heading">
      <h2 id="cover-heading" className="mb-3 font-sans text-sm font-medium">
        {t.cover}
      </h2>
      {path ? (
        <div className="relative mb-3 aspect-[16/9] max-w-md overflow-hidden bg-muted">
          <Image src={imageUrl(path)} alt="" fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">{t.coverEmpty}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={path ? t.coverReplace : t.coverUpload}
        data-testid="cover-input"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? t.uploading(0, 1) : path ? t.coverReplace : t.coverUpload}
      </Button>
    </section>
  );
}
