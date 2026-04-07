"use client";

import { Editor } from "@tiptap/react";
import { useRef } from "react";

interface Props {
  editor: Editor;
  postSlug: string;
}

const btn =
  "px-2 py-1 rounded text-sm hover:bg-white/10 transition-colors disabled:opacity-30";
const activebtn = "bg-white/20";

export default function Toolbar({ editor, postSlug }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const e = editor;

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", postSlug || "uploads");
    const res = await fetch("http://localhost:3001/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    e.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--sidebar-bg)" }}
    >
      {/* Headings */}
      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          className={`${btn} ${e.isActive("heading", { level }) ? activebtn : ""}`}
          onMouseDown={(ev) => {
            ev.preventDefault();
            e.chain().focus().toggleHeading({ level }).run();
          }}
        >
          H{level}
        </button>
      ))}

      <span className="w-px h-4 mx-1" style={{ background: "var(--border-color)" }} />

      {/* Inline marks */}
      <button
        className={`${btn} font-bold ${e.isActive("bold") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBold().run(); }}
      >
        B
      </button>
      <button
        className={`${btn} italic ${e.isActive("italic") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleItalic().run(); }}
      >
        I
      </button>
      <button
        className={`${btn} ${e.isActive("code") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleCode().run(); }}
      >
        <span style={{ fontFamily: "monospace" }}>`code`</span>
      </button>

      <span className="w-px h-4 mx-1" style={{ background: "var(--border-color)" }} />

      {/* Lists */}
      <button
        className={`${btn} ${e.isActive("bulletList") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBulletList().run(); }}
        title="Bullet list"
      >
        • List
      </button>
      <button
        className={`${btn} ${e.isActive("orderedList") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleOrderedList().run(); }}
        title="Numbered list"
      >
        1. List
      </button>

      <span className="w-px h-4 mx-1" style={{ background: "var(--border-color)" }} />

      {/* Block */}
      <button
        className={`${btn} ${e.isActive("blockquote") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBlockquote().run(); }}
        title="Blockquote"
      >
        ❝
      </button>
      <button
        className={`${btn} ${e.isActive("codeBlock") ? activebtn : ""}`}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleCodeBlock().run(); }}
        title="Code block"
      >
        <span style={{ fontFamily: "monospace" }}>{"</>"}</span>
      </button>
      <button
        className={btn}
        onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().setHorizontalRule().run(); }}
        title="Divider"
      >
        ―
      </button>

      <span className="w-px h-4 mx-1" style={{ background: "var(--border-color)" }} />

      {/* Image */}
      <button
        className={btn}
        onMouseDown={(ev) => { ev.preventDefault(); fileRef.current?.click(); }}
        title="Upload image"
      >
        🖼 Image
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(ev) => {
          const file = ev.target.files?.[0];
          if (file) uploadImage(file);
          ev.target.value = "";
        }}
      />
    </div>
  );
}
