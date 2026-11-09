"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import { removeUploadedImage, uploadImage } from "./upload-image";

const t = strings.admin.editor;

type Props = {
  /** התיקייה ב-Storage, למשל about או projects/<id> */
  folder: string;
  path: string | null;
  labels: { heading: string; empty: string; upload: string; replace: string };
  save: (path: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  onChange: (path: string) => void;
};

export function ImagePicker({ folder, path, labels, save, onChange }: Props) {
  const headingId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImage(folder, file);
      const result = await save(uploaded);
      if (!result.ok) {
        await removeUploadedImage(uploaded);
        toast.error(result.error);
        return;
      }
      onChange(uploaded);
      toast.success(t.imageSaved);
    } catch (error) {
      console.error("image upload failed", error);
      toast.error(t.imageFailed(file.name));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="mb-3 font-sans text-sm font-medium">
        {labels.heading}
      </h2>
      {path ? (
        <div className="relative mb-3 aspect-[16/9] max-w-md overflow-hidden bg-muted">
          <Image src={imageUrl(path)} alt="" fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
        </div>
      ) : (
        <p className="mb-3 text-sm text-muted-foreground">{labels.empty}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={path ? labels.replace : labels.upload}
        data-testid="cover-input"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? t.uploading(0, 1) : path ? labels.replace : labels.upload}
      </Button>
    </section>
  );
}
