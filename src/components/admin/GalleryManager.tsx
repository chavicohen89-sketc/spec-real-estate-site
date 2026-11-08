"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addGalleryImageAction,
  deleteGalleryImageAction,
  reorderGalleryAction,
  updateImageAltAction,
} from "@/app/admin/(panel)/projects/actions";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import type { AdminGalleryImage } from "@/server/projects";
import { removeUploadedImage, uploadProjectImage } from "./upload-image";

const t = strings.admin.editor;

type TileProps = {
  projectId: string;
  image: AdminGalleryImage;
  index: number;
  onDelete: (id: string) => void;
};

function Tile({ projectId, image, index, onDelete }: TileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });
  const lastSaved = useRef(image.alt);

  async function saveAlt(value: string) {
    if (value === lastSaved.current) return;
    const result = await updateImageAltAction(projectId, image.id, value);
    if (result.ok) lastSaved.current = value;
    else toast.error(result.error);
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`grid gap-2 bg-background ${isDragging ? "relative z-10 opacity-80" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl(image.path)}
          alt={image.alt || t.imageAlt(index + 1)}
          fill
          sizes="(min-width: 768px) 280px, 50vw"
          className="object-cover"
        />
        <button
          type="button"
          aria-label={t.dragImage(index + 1)}
          className="absolute start-1 top-1 cursor-grab touch-none bg-background/90 p-1.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t.deleteImage}
          className="absolute end-1 top-1 bg-background/90 p-1.5"
          onClick={() => onDelete(image.id)}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <Input
        aria-label={t.altLabel}
        placeholder={t.altLabel}
        defaultValue={image.alt}
        maxLength={300}
        onBlur={(e) => saveAlt(e.target.value)}
      />
    </li>
  );
}

type Props = { projectId: string; initialImages: AdminGalleryImage[] };

export function GalleryManager({ projectId, initialImages }: Props) {
  const [images, setImages] = useState(initialImages);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function onFiles(files: File[]) {
    if (files.length === 0) return;
    // אחת אחרי השנייה: שומר על הסדר שנבחר ולא מעמיס על זיכרון הטלפון
    for (const [index, file] of files.entries()) {
      setProgress({ done: index, total: files.length });
      try {
        const path = await uploadProjectImage(projectId, file);
        const result = await addGalleryImageAction(projectId, path);
        if (result.ok) {
          setImages((current) => [...current, result.image]);
        } else {
          await removeUploadedImage(path);
          toast.error(result.error);
        }
      } catch (error) {
        console.error("gallery upload failed", error);
        toast.error(t.imageFailed(file.name));
      }
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const previous = images;
    const next = arrayMove(
      images,
      images.findIndex((i) => i.id === active.id),
      images.findIndex((i) => i.id === over.id),
    );
    setImages(next);
    const result = await reorderGalleryAction(projectId, next.map((i) => i.id));
    if (!result.ok) {
      setImages(previous);
      toast.error(result.error);
    }
  }

  async function onDelete(imageId: string) {
    const previous = images;
    setImages(images.filter((i) => i.id !== imageId));
    const result = await deleteGalleryImageAction(projectId, imageId);
    if (result.ok) {
      toast.success(t.imageDeleted);
    } else {
      setImages(previous);
      toast.error(result.error);
    }
  }

  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className="mb-1 font-sans text-sm font-medium">
        {t.gallery}
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">{t.galleryHint}</p>

      {images.length === 0 ? (
        <p className="mb-3 text-sm text-muted-foreground">{t.galleryEmpty}</p>
      ) : (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <ul className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {images.map((image, index) => (
                <Tile key={image.id} projectId={projectId} image={image} index={index} onDelete={onDelete} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label={t.galleryUpload}
        data-testid="gallery-input"
        onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
      />
      <Button type="button" variant="outline" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
        {progress ? t.uploading(progress.done + 1, progress.total) : t.galleryUpload}
      </Button>
    </section>
  );
}
