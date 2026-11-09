"use client";

import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  countAudienceAction,
  previewCampaignAction,
  sendCampaignAction,
  sendTestCampaignAction,
} from "@/app/admin/(panel)/email/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin/ui/alert-dialog";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { strings } from "@/lib/strings";
import type { Audience } from "@/lib/validation/campaign";
import { RichTextEditor } from "./RichTextEditor";

const t = strings.admin.email;
const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm";

function toAudience(value: string): Audience {
  if (value === "all" || value === "general") return { type: value };
  return { type: "project", projectId: value };
}

export function CampaignComposer({ projects }: { projects: { id: string; title: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState<JSONContent | null>(null);
  const [audience, setAudience] = useState("all");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [confirmCount, setConfirmCount] = useState<number | null>(null);
  // מזהה קבוע לשליחה הזאת: לחיצה כפולה נתקלת במפתח הראשי ולא שולחת פעמיים
  const [campaignId, setCampaignId] = useState(() => crypto.randomUUID());

  const content = { subject, body };

  function preview() {
    startTransition(async () => {
      const result = await previewCampaignAction(content);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPreviewHtml(result.html);
    });
  }

  function sendTest() {
    startTransition(async () => {
      const result = await sendTestCampaignAction(content);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.testSent(result.email));
    });
  }

  function askToSend() {
    startTransition(async () => {
      // בודקים את התוכן לפני הצגת מספר הנמענים
      const valid = await previewCampaignAction(content);
      if (!valid.ok) {
        toast.error(valid.error);
        return;
      }
      const result = await countAudienceAction(toAudience(audience));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (result.count === 0) {
        toast.error(t.errors.noRecipients);
        return;
      }
      setConfirmCount(result.count);
    });
  }

  function send() {
    setConfirmCount(null);
    startTransition(async () => {
      const result = await sendCampaignAction(campaignId, {
        ...content,
        audience: toAudience(audience),
      });
      if (!result.ok) {
        toast.error(result.error);
        setCampaignId(crypto.randomUUID());
        return;
      }
      if (result.failed > 0) toast.warning(t.sentPartly(result.sent, result.failed));
      else toast.success(t.sent(result.sent));
      // Next שומר את מצב המסך בין ניווטים: בלי איפוס הטופס יחזור מלא
      setSubject("");
      setBody(null);
      setPreviewHtml(null);
      setCampaignId(crypto.randomUUID());
      router.push("/admin/email/history");
    });
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl">{t.title}</h1>

      <div className="grid gap-1.5">
        <Label htmlFor="campaign-subject">{t.subject}</Label>
        <Input
          id="campaign-subject"
          value={subject}
          maxLength={200}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <span id="campaign-body-label" className="text-sm font-medium">
          {t.body}
        </span>
        {/* key: העורך קורא את הערך רק בטעינה, ולכן שליחה חדשה יוצרת עורך ריק */}
        <RichTextEditor key={campaignId} labelId="campaign-body-label" value={body} onChange={setBody} />
      </div>

      <div className="grid gap-1.5 sm:max-w-sm">
        <Label htmlFor="campaign-audience">{t.audience}</Label>
        <select
          id="campaign-audience"
          value={audience}
          onChange={(event) => setAudience(event.target.value)}
          className={SELECT_CLASS}
        >
          <option value="all">{t.audienceAll}</option>
          <option value="general">{t.audienceGeneral}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {t.audienceProject(project.title)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <Button type="button" disabled={pending} onClick={askToSend}>
          {pending ? t.sending : t.send}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={preview}>
          {t.preview}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={sendTest}>
          {t.sendTest}
        </Button>
      </div>

      {previewHtml !== null && (
        // sandbox ריק: התצוגה לא מריצה סקריפטים ולא מנווטת
        <iframe
          title={t.previewFrame}
          srcDoc={previewHtml}
          sandbox=""
          className="h-[36rem] w-full border"
        />
      )}

      <AlertDialog
        open={confirmCount !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmCount(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmBody(confirmCount ?? 0)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.admin.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={send}>{t.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
