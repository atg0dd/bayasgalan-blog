"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import Toolbar from "./Toolbar";
import { useEffect, useImperativeHandle, forwardRef } from "react";

export interface EditorHandle {
  getMarkdown: () => string;
  setMarkdown: (md: string) => void;
}

interface Props {
  postSlug: string;
  initialContent?: string;
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
  ({ postSlug, initialContent = "" }, ref) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({ placeholder: "Start writing your post…" }),
        Markdown.configure({ html: false, transformPastedText: true }),
      ],
      content: "",
      editorProps: {
        attributes: {
          class: "outline-none min-h-[60vh] py-6 px-1",
        },
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
        <div
          className="flex-1 overflow-y-auto px-8 py-2"
          style={{ color: "var(--foreground)" }}
        >
          <EditorContent editor={editor} className="prose max-w-none" />
        </div>
      </div>
    );
  }
);

BlogEditor.displayName = "BlogEditor";
export default BlogEditor;
