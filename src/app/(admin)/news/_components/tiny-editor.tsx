"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full rounded-2xl border border-border bg-muted/20 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
        <span>กำลังโหลดเครื่องมือจัดรูปแบบข้อความ (Tiny Editor)...</span>
      </div>
    ),
  }
);

export function TinyEditor({
  value,
  onChange,
  placeholder = "",
  height = 300,
  disabled = false,
}: TinyEditorProps) {
  const id = useId();

  return (
    <div className="rounded-2xl overflow-hidden border border-border focus-within:ring-2 focus-within:ring-brand shadow-2xs">
      <Editor
        id={id}
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/7.7.2/tinymce.min.js"
        value={value}
        disabled={disabled}
        onEditorChange={(newContent) => onChange(newContent)}
        init={{
          height,
          menubar: false,
          statusbar: true,
          branding: false,
          promotion: false,
          placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline | " +
            "bullist numlist | alignleft aligncenter alignright alignjustify | " +
            "table link | removeformat | code fullscreen",
          content_style:
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 12px; }",
        }}
      />
    </div>
  );
}
