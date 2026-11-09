"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setMessageHandledAction } from "@/app/admin/(panel)/messages/actions";
import { Button } from "@/components/admin/ui/button";
import { strings } from "@/lib/strings";

const t = strings.admin.messages;

export function MessageHandledButton({ id, handled }: { id: string; handled: boolean }) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setMessageHandledAction(id, !handled);
      if (result.ok) toast.success(t.updated);
      else toast.error(result.error);
    });
  }

  return (
    <Button type="button" size="sm" variant={handled ? "ghost" : "outline"} disabled={pending} onClick={toggle}>
      {handled ? t.markUnhandled : t.markHandled}
    </Button>
  );
}
