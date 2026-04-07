"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { Markdown } from "tiptap-markdown";
import Toolbar from "./Toolbar";
import SlashMenu, { type SlashMenuHandle } from "./SlashMenu";
import { SlashCommands } from "./extensions/slashCommands";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from "react";

export interface EditorHandle {
  getMarkdown: () => string;
  setMarkdown: (md: string) => void;
}

interface Props {
  postSlug: string;
  initialContent?: string;
  onSave?: () => void;
}

async function uploadImageFile(file: File, postSlug: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", postSlug || "uploads");
  const res = await fetch("http://localhost:3001/upload", { method: "POST", body: fd });
  const { url } = await res.json();
  return url as string;
}

const BlogEditor = forwardRef<EditorHandle, Props>(
  ({ postSlug, initialContent = "", onSave }, ref) => {
    const slashMenuRef = useRef<SlashMenuHandle>(null);
    const [wordCount, setWordCount] = useState(0);
    const [linkInput, setLinkInput] = useState("");

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({ placeholder: 'Start writing, or type "/" for commands…' }),
        Markdown.configure({ html: false, transformPastedText: true }),
        Link.configure({ openOnClick: false, autolink: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: false }),
        Youtube.configure({ width: 640, height: 360 }),
        CharacterCount,
        Details.configure({ persist: true }),
        DetailsSummary,
        DetailsContent,
        Underline,
        SlashCommands.configure({
          onOpen: (props) => slashMenuRef.current?.open(props),
          onUpdate: (props) => slashMenuRef.current?.update(props),
          onKeyDown: (props) => slashMenuRef.current?.handleKeyDown(props) ?? false,
          onClose: () => slashMenuRef.current?.close(),
        }),
      ],
      content: "",
      onUpdate: ({ editor }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = (editor.storage as any).characterCount?.words?.() ?? 0;
        setWordCount(count);
      },
      editorProps: {
        attributes: { class: "outline-none min-h-[60vh] py-6 px-1" },
        handlePaste(view, event) {
          const items = event.clipboardData?.items;
          if (!items) return false;
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (!file) continue;
              uploadImageFile(file, postSlug).then((url) => {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: url })
                  )
                );
              });
              return true;
            }
          }
          return false;
        },
        handleDrop(view, event) {
          const files = event.dataTransfer?.files;
          if (!files?.length) return false;
          const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
          if (!imageFiles.length) return false;
          event.preventDefault();
          const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          imageFiles.forEach((file) => {
            uploadImageFile(file, postSlug).then((url) => {
              const node = view.state.schema.nodes.image.create({ src: url });
              const tr = view.state.tr.insert(pos?.pos ?? view.state.selection.anchor, node);
              view.dispatch(tr);
            });
          });
          return true;
        },
      },
    });

    // Cmd+S to save
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          onSave?.();
        }
      },
      [onSave]
    );
    useEffect(() => {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
      if (editor && initialContent) {
        editor.commands.setContent(initialContent);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, initialContent]);

    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        if (!editor) return "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (editor.storage as any).markdown.getMarkdown();
      },
      setMarkdown: (md: string) => {
        editor?.commands.setContent(md);
      },
    }));

    if (!editor) return null;

    return (
      <div className="flex flex-col h-full">
        <Toolbar editor={editor} postSlug={postSlug} />

        {/* Link bubble menu */}
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: e }: { editor: typeof editor }) => e!.isActive("link")}
        >
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg border text-sm"
            style={{ background: "var(--card-bg)", borderColor: "var(--border-color)" }}
          >
            <input
              value={linkInput || editor.getAttributes("link").href || ""}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  editor.chain().focus().setLink({ href: linkInput }).run();
                  setLinkInput("");
                }
              }}
              placeholder="https://..."
              className="bg-transparent outline-none w-48 text-xs"
              style={{ color: "var(--foreground)" }}
            />
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setLink({ href: linkInput || editor.getAttributes("link").href }).run();
                setLinkInput("");
              }}
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Set
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetLink().run();
              }}
              className="px-2 py-0.5 rounded text-xs hover:opacity-70"
              style={{ color: "var(--muted)" }}
            >
              Remove
            </button>
          </div>
        </BubbleMenu>

        <div
          className="flex-1 overflow-y-auto px-8 py-2"
          style={{ color: "var(--foreground)" }}
        >
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>

        {/* Word count */}
        <div
          className="shrink-0 px-8 py-1.5 text-xs border-t text-right"
          style={{ borderColor: "var(--border-color)", color: "var(--muted)", background: "var(--sidebar-bg)" }}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"} · Type / for commands · ⌘S to save
        </div>

        <SlashMenu ref={slashMenuRef} />
      </div>
    );
  }
);

BlogEditor.displayName = "BlogEditor";
export default BlogEditor;
