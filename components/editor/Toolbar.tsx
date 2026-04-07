"use client";

import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";

interface Props {
  editor: Editor;
  postSlug: string;
}

const btn = "px-2 py-1 rounded text-sm hover:bg-white/10 transition-colors disabled:opacity-30 shrink-0";
const active = "bg-white/20";

export default function Toolbar({ editor, postSlug }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkInput, setLinkInput] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const e = editor;

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", postSlug || "uploads");
    const res = await fetch("http://localhost:3001/upload", { method: "POST", body: fd });
    const { url } = await res.json();
    e.chain().focus().setImage({ src: url }).run();
  }

  function applyLink() {
    if (linkInput) {
      e.chain().focus().setLink({ href: linkInput }).run();
    }
    setLinkInput("");
    setShowLink(false);
  }

  function applyYoutube() {
    if (youtubeUrl) {
      e.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    }
    setYoutubeUrl("");
    setShowYoutube(false);
  }

  const sep = <span className="w-px h-4 mx-1 shrink-0" style={{ background: "var(--border-color)" }} />;

  return (
    <div
      className="shrink-0 border-b"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--sidebar-bg)" }}
    >
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 overflow-x-auto">
        {/* Headings */}
        {([1, 2, 3] as const).map((level) => (
          <button key={level} className={`${btn} ${e.isActive("heading", { level }) ? active : ""}`}
            onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleHeading({ level }).run(); }}>
            H{level}
          </button>
        ))}

        {sep}

        {/* Inline marks */}
        <button className={`${btn} font-bold ${e.isActive("bold") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBold().run(); }} title="Bold ⌘B">
          B
        </button>
        <button className={`${btn} italic ${e.isActive("italic") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleItalic().run(); }} title="Italic ⌘I">
          I
        </button>
        <button className={`${btn} underline ${e.isActive("underline") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleUnderline().run(); }} title="Underline ⌘U">
          U
        </button>
        <button className={`${btn} line-through ${e.isActive("strike") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleStrike().run(); }} title="Strikethrough">
          S
        </button>
        <button
          className={`${btn} ${e.isActive("highlight") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleHighlight().run(); }}
          title="Highlight"
          style={e.isActive("highlight") ? { background: "rgba(250,220,80,0.3)" } : undefined}
        >
          ▌
        </button>
        <button className={`${btn} ${e.isActive("code") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleCode().run(); }} title="Inline code ⌘E">
          <span style={{ fontFamily: "monospace" }}>`</span>
        </button>

        {sep}

        {/* Lists */}
        <button className={`${btn} ${e.isActive("bulletList") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBulletList().run(); }} title="Bullet list">
          • List
        </button>
        <button className={`${btn} ${e.isActive("orderedList") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleOrderedList().run(); }} title="Numbered list">
          1. List
        </button>
        <button className={`${btn} ${e.isActive("taskList") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleTaskList().run(); }} title="Task list">
          ☑ Tasks
        </button>

        {sep}

        {/* Blocks */}
        <button className={`${btn} ${e.isActive("blockquote") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleBlockquote().run(); }} title="Blockquote">
          ❝
        </button>
        <button className={`${btn} ${e.isActive("codeBlock") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().toggleCodeBlock().run(); }} title="Code block ⌘⌥C">
          <span style={{ fontFamily: "monospace" }}>{"</>"}</span>
        </button>
        <button className={btn}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().setHorizontalRule().run(); }} title="Divider">
          ―
        </button>

        {sep}

        {/* Insert */}
        <button
          className={`${btn} ${e.isActive("link") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); setShowLink((v) => !v); setShowYoutube(false); }}
          title="Link ⌘K"
        >
          🔗 Link
        </button>
        <button
          className={`${btn} ${e.isActive("details") ? active : ""}`}
          onMouseDown={(ev) => { ev.preventDefault(); e.chain().focus().setDetails().run(); }}
          title="Toggle block"
        >
          ▶ Toggle
        </button>
        <button
          className={btn}
          onMouseDown={(ev) => {
            ev.preventDefault();
            e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          title="Insert table"
        >
          ⊞ Table
        </button>
        <button
          className={btn}
          onMouseDown={(ev) => { ev.preventDefault(); setShowYoutube((v) => !v); setShowLink(false); }}
          title="YouTube embed"
        >
          ▶ YouTube
        </button>
        <button
          className={btn}
          onMouseDown={(ev) => { ev.preventDefault(); fileRef.current?.click(); }}
          title="Upload image"
        >
          🖼 Image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(ev) => { const f = ev.target.files?.[0]; if (f) uploadImage(f); ev.target.value = ""; }} />
      </div>

      {/* Link input row */}
      {showLink && (
        <div className="flex items-center gap-2 px-3 pb-2">
          <input
            autoFocus
            value={linkInput}
            onChange={(ev) => setLinkInput(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && applyLink()}
            placeholder="https://..."
            className="flex-1 bg-transparent border rounded px-2 py-1 text-sm outline-none"
            style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
          />
          <button onClick={applyLink} className="px-3 py-1 rounded text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Apply
          </button>
          {e.isActive("link") && (
            <button onClick={() => { e.chain().focus().unsetLink().run(); setShowLink(false); }}
              className="px-3 py-1 rounded text-sm" style={{ color: "var(--muted)" }}>
              Remove
            </button>
          )}
        </div>
      )}

      {/* YouTube input row */}
      {showYoutube && (
        <div className="flex items-center gap-2 px-3 pb-2">
          <input
            autoFocus
            value={youtubeUrl}
            onChange={(ev) => setYoutubeUrl(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && applyYoutube()}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 bg-transparent border rounded px-2 py-1 text-sm outline-none"
            style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
          />
          <button onClick={applyYoutube} className="px-3 py-1 rounded text-sm"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Embed
          </button>
        </div>
      )}
    </div>
  );
}
