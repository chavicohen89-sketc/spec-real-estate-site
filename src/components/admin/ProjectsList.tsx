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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { reorderProjectsAction } from "@/app/admin/(panel)/projects/actions";
import { Badge } from "@/components/admin/ui/badge";
import { imageUrl } from "@/lib/storage";
import { strings } from "@/lib/strings";
import type { AdminProjectRow } from "@/server/projects";

const t = strings.admin.projects;

function Row({ project }: { project: AdminProjectRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const published = project.status === "published";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`flex items-center gap-3 border-b bg-background py-3 ${isDragging ? "relative z-10 opacity-80" : ""}`}
    >
      <button
        type="button"
        aria-label={t.dragHandle(project.title)}
        className="cursor-grab touch-none p-2 text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-muted">
        {project.coverImagePath ? (
          <Image
            src={imageUrl(project.coverImagePath)}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <span className="sr-only">{t.noImage}</span>
        )}
      </div>
      <Link href={`/admin/projects/${project.id}`} className="min-w-0 flex-1 truncate hover:underline">
        {project.title}
      </Link>
      <Badge variant={published ? "default" : "outline"}>
        {published ? t.statusPublished : t.statusDraft}
      </Badge>
    </li>
  );
}

export function ProjectsList({ initialProjects }: { initialProjects: AdminProjectRow[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const previous = projects;
    const next = arrayMove(
      projects,
      projects.findIndex((p) => p.id === active.id),
      projects.findIndex((p) => p.id === over.id),
    );
    setProjects(next);

    const result = await reorderProjectsAction(next.map((p) => p.id));
    if (result.ok) {
      toast.success(t.orderSaved);
    } else {
      setProjects(previous);
      toast.error(result.error);
    }
  }

  if (projects.length === 0) {
    return <p className="text-muted-foreground">{t.empty}</p>;
  }

  return (
    <>
      <p className="mb-2 text-sm text-muted-foreground">{t.dragHint}</p>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <ul className="border-t">
            {projects.map((project) => (
              <Row key={project.id} project={project} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
