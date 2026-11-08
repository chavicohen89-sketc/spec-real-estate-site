"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { Bold, Heading2, Heading3, Link2, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { richTextExtensions } from "@/lib/rich-text";
import { strings } from "@/lib/strings";

const t = strings.admin.editor.toolbar;

type Props = {
  labelId: string;
  value: JSONContent | null;
  onChange: (value: JSONContent) => void;
};

export function RichTextEditor({ labelId, value, onChange }: Props) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value ?? undefined,
    immediatelyRender: false, // בלי זה יש אי-התאמה בין השרת לדפדפן
    editorProps: {
      attributes: { class: "rich-text", "aria-labelledby": labelId, role: "textbox" },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      bold: e?.isActive("bold") ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      link: e?.isActive("link") ?? false,
    }),
  });

  function setLink() {
    if (!editor) return;
    const url = window.prompt(t.linkPrompt, editor.getAttributes("link").href ?? "");
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "") chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  }

  const tools = [
    { label: t.heading2, Icon: Heading2, on: active?.h2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: t.heading3, Icon: Heading3, on: active?.h3, run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: t.bold, Icon: Bold, on: active?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: t.bulletList, Icon: List, on: active?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: t.orderedList, Icon: ListOrdered, on: active?.ordered, run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: t.link, Icon: Link2, on: active?.link, run: setLink },
  ];

  return (
    <div className="rounded-md border border-input">
      <div role="toolbar" aria-label={t.label} className="flex flex-wrap gap-1 border-b p-1">
        {tools.map(({ label, Icon, on, run }) => (
          <Button
            key={label}
            type="button"
            size="icon"
            variant={on ? "secondary" : "ghost"}
            aria-label={label}
            aria-pressed={on ?? false}
            title={label}
            onClick={run}
          >
            <Icon />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} className="rich-text-editor" />
    </div>
  );
}
