"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProjectAction } from "@/app/admin/(panel)/projects/actions";
import { Button } from "@/components/admin/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { strings } from "@/lib/strings";

const t = strings.admin.projects;

export function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createProjectAction(String(formData.get("title") ?? ""));
      if (result.ok) {
        setOpen(false);
        router.push(`/admin/projects/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button>{t.new}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.newTitle}</DialogTitle>
          <DialogDescription>{t.newLead}</DialogDescription>
        </DialogHeader>
        <form action={submit} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-project-title">{strings.admin.editor.fieldTitle}</Label>
            <Input
              id="new-project-title"
              name="title"
              autoFocus
              aria-invalid={error ? true : undefined}
            />
            {error && (
              <p role="alert" className="text-sm">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
