import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from "@tiptap/suggestion";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: SuggestionProps["editor"]; range: SuggestionProps["range"] }) => void;
}

export function getSlashItems(query: string): SlashCommandItem[] {
  const all: SlashCommandItem[] = [
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: "H1",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: "H2",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: "H3",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      icon: "•",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      icon: "1.",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Task List",
      description: "Checkbox to-do list",
      icon: "☑",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      title: "Code Block",
      description: "Syntax-highlighted code",
      icon: "</>",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Blockquote",
      description: "Highlighted quote",
      icon: "❝",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Table",
      description: "Insert a 3×3 table",
      icon: "⊞",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "Toggle",
      description: "Collapsible toggle block",
      icon: "▶",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setDetails().run(),
    },
    {
      title: "Divider",
      description: "Horizontal rule",
      icon: "—",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "YouTube",
      description: "Embed a YouTube video",
      icon: "▶",
      command: ({ editor, range }) => {
        const url = prompt("YouTube URL:");
        if (url) {
          editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run();
        } else {
          editor.chain().focus().deleteRange(range).run();
        }
      },
    },
  ];

  if (!query) return all;
  return all.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );
}

export interface SlashMenuCallbacks {
  onOpen: (props: SuggestionProps & { coords: { top: number; left: number } }) => void;
  onUpdate: (props: SuggestionProps & { coords: { top: number; left: number } }) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onClose: () => void;
}

export const SlashCommands = Extension.create<SlashMenuCallbacks>({
  name: "slashCommands",

  addOptions() {
    return {
      onOpen: () => {},
      onUpdate: () => {},
      onKeyDown: () => false,
      onClose: () => {},
    };
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ext = this;
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }) => getSlashItems(query),
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).command({ editor, range });
        },
        render() {
          return {
            onStart(props) {
              const coords = props.editor.view.coordsAtPos(props.range.from);
              ext.options.onOpen({ ...props, coords });
            },
            onUpdate(props) {
              const coords = props.editor.view.coordsAtPos(props.range.from);
              ext.options.onUpdate({ ...props, coords });
            },
            onKeyDown(props) {
              return ext.options.onKeyDown(props);
            },
            onExit() {
              ext.options.onClose();
            },
          };
        },
      }),
    ];
  },
});
