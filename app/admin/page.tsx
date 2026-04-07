"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorHandle } from "@/components/editor/Editor";

const API = "http://localhost:3001";

const BlogEditor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
});

interface PostMeta {
  slug: string;
  title?: string;
  date?: string;
}

interface Frontmatter {
  title: string;
  date: string;
  category: string;
  subcategory: string;
  summary: string;
  coverImage: string;
}

const emptyFm = (): Frontmatter => ({
  title: "",
  date: new Date().toISOString().split("T")[0],
  category: "Tech",
  subcategory: "",
  summary: "",
  coverImage: "",
});

export default function AdminPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [fm, setFm] = useState<Frontmatter>(emptyFm());
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

  const loadPosts = useCallback(async () => {
    const res = await fetch(`${API}/posts`);
    const data: PostMeta[] = await res.json();
    setPosts(data.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")));
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  async function openPost(slug: string) {
    const res = await fetch(`${API}/posts/${slug}`);
    if (!res.ok) return;
    const data = await res.json();
    setActiveSlug(slug);
    setFm({
      title: data.frontmatter.title ?? "",
      date: data.frontmatter.date ?? new Date().toISOString().split("T")[0],
      category: data.frontmatter.category ?? "Tech",
      subcategory: data.frontmatter.subcategory ?? "",
      summary: data.frontmatter.summary ?? "",
      coverImage: data.frontmatter.coverImage ?? "",
    });
    setInitialContent(data.content ?? "");
  }

  async function save() {
    if (!activeSlug) return;
    setSaving(true);
    setStatus("");
    const content = editorRef.current?.getMarkdown() ?? "";
    const res = await fetch(`${API}/posts/${activeSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontmatter: fm, content }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus("Saved ✓");
      loadPosts();
      setTimeout(() => setStatus(""), 2000);
    } else {
      setStatus("Save failed");
    }
  }

  async function createPost() {
    if (!newSlug.trim()) return;
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, "-");
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        frontmatter: emptyFm(),
        content: "",
      }),
    });
    if (res.ok) {
      setNewSlug("");
      setCreating(false);
      await loadPosts();
      await openPost(slug);
    } else {
      const err = await res.json();
      setStatus(err.error ?? "Error creating post");
    }
  }

  async function deletePost(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    await fetch(`${API}/posts/${slug}`, { method: "DELETE" });
    if (activeSlug === slug) {
      setActiveSlug(null);
      setFm(emptyFm());
      setInitialContent("");
    }
    loadPosts();
  }

  return (
    <div
      className="flex h-full text-sm"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col shrink-0 border-r"
        style={{
          borderColor: "var(--border-color)",
          backgroundColor: "var(--sidebar-bg)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b font-semibold text-xs uppercase tracking-widest"
          style={{ borderColor: "var(--border-color)", color: "var(--muted)" }}
        >
          Posts
          <button
            className="text-lg leading-none hover:opacity-70"
            onClick={() => setCreating((v) => !v)}
            title="New post"
          >
            +
          </button>
        </div>

        {creating && (
          <div className="px-3 py-2 flex gap-1 border-b" style={{ borderColor: "var(--border-color)" }}>
            <input
              autoFocus
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createPost()}
              placeholder="post-slug"
              className="flex-1 bg-transparent border rounded px-2 py-1 text-xs outline-none"
              style={{ borderColor: "var(--border-color)" }}
            />
            <button
              onClick={createPost}
              className="px-2 py-1 rounded text-xs"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ✓
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {posts.map((p) => (
            <div
              key={p.slug}
              className="group flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/5"
              style={{
                background: activeSlug === p.slug ? "rgba(168,145,217,0.15)" : undefined,
                borderLeft: activeSlug === p.slug ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onClick={() => openPost(p.slug)}
            >
              <div className="min-w-0">
                <p className="truncate font-medium" style={{ color: "var(--foreground)" }}>
                  {p.title || p.slug}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {p.date ?? ""}
                </p>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 ml-1 shrink-0 hover:text-red-400 transition-opacity"
                onClick={(e) => { e.stopPropagation(); deletePost(p.slug); }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {activeSlug ? (
          <>
            {/* Frontmatter bar */}
            <div
              className="shrink-0 px-8 py-4 border-b space-y-3"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--sidebar-bg)" }}
            >
              <input
                value={fm.title}
                onChange={(e) => setFm({ ...fm, title: e.target.value })}
                placeholder="Post title"
                className="w-full bg-transparent text-2xl font-bold outline-none placeholder:opacity-30"
                style={{ color: "var(--foreground)" }}
              />
              <div className="flex flex-wrap gap-3">
                <Field label="Date">
                  <input
                    type="date"
                    value={fm.date}
                    onChange={(e) => setFm({ ...fm, date: e.target.value })}
                    className="bg-transparent outline-none"
                    style={{ color: "var(--foreground)" }}
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={fm.category}
                    onChange={(e) => setFm({ ...fm, category: e.target.value })}
                    placeholder="Tech"
                    className="bg-transparent outline-none w-24"
                    style={{ color: "var(--foreground)" }}
                  />
                </Field>
                <Field label="Subcategory">
                  <input
                    value={fm.subcategory}
                    onChange={(e) => setFm({ ...fm, subcategory: e.target.value })}
                    placeholder="optional"
                    className="bg-transparent outline-none w-32"
                    style={{ color: "var(--foreground)" }}
                  />
                </Field>
                <Field label="Cover image">
                  <input
                    value={fm.coverImage}
                    onChange={(e) => setFm({ ...fm, coverImage: e.target.value })}
                    placeholder="/images/..."
                    className="bg-transparent outline-none w-48"
                    style={{ color: "var(--foreground)" }}
                  />
                </Field>
              </div>
              <textarea
                value={fm.summary}
                onChange={(e) => setFm({ ...fm, summary: e.target.value })}
                placeholder="Short summary / subtitle…"
                rows={2}
                className="w-full bg-transparent outline-none resize-none text-sm placeholder:opacity-30"
                style={{ color: "var(--muted)" }}
              />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <BlogEditor
                key={activeSlug}
                ref={editorRef}
                postSlug={activeSlug}
                initialContent={initialContent}
              />
            </div>

            {/* Footer bar */}
            <div
              className="shrink-0 flex items-center justify-between px-8 py-3 border-t text-xs"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--sidebar-bg)" }}
            >
              <span style={{ color: "var(--muted)" }}>
                {activeSlug}.mdx
              </span>
              <div className="flex items-center gap-4">
                {status && (
                  <span style={{ color: status.includes("✓") ? "var(--accent)" : "red" }}>
                    {status}
                  </span>
                )}
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-1.5 rounded font-semibold disabled:opacity-50"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex-1 flex items-center justify-center text-sm"
            style={{ color: "var(--muted)" }}
          >
            Select a post or create a new one (+)
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
      <span className="uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
