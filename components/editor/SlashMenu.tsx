"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { createPortal } from "react-dom";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import type { SlashCommandItem } from "./extensions/slashCommands";

export interface SlashMenuHandle {
  open: (props: SuggestionProps & { coords: { top: number; left: number } }) => void;
  update: (props: SuggestionProps & { coords: { top: number; left: number } }) => void;
  handleKeyDown: (props: SuggestionKeyDownProps) => boolean;
  close: () => void;
}

const SlashMenu = forwardRef<SlashMenuHandle>((_, ref) => {
  const [state, setState] = useState<{
    items: SlashCommandItem[];
    coords: { top: number; left: number };
    command: (item: SlashCommandItem) => void;
    selectedIndex: number;
  } | null>(null);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  useImperativeHandle(ref, () => ({
    open(props) {
      setState({
        items: props.items as SlashCommandItem[],
        coords: props.coords,
        command: (item) => props.command(item),
        selectedIndex: 0,
      });
    },
    update(props) {
      setState((prev) =>
        prev
          ? {
              ...prev,
              items: props.items as SlashCommandItem[],
              coords: props.coords,
              selectedIndex: 0,
            }
          : null
      );
    },
    handleKeyDown({ event }) {
      const s = stateRef.current;
      if (!s) return false;
      if (event.key === "ArrowDown") {
        setState((prev) =>
          prev ? { ...prev, selectedIndex: (prev.selectedIndex + 1) % prev.items.length } : null
        );
        return true;
      }
      if (event.key === "ArrowUp") {
        setState((prev) =>
          prev
            ? { ...prev, selectedIndex: (prev.selectedIndex - 1 + prev.items.length) % prev.items.length }
            : null
        );
        return true;
      }
      if (event.key === "Enter") {
        const item = s.items[s.selectedIndex];
        if (item) s.command(item);
        return true;
      }
      if (event.key === "Escape") {
        setState(null);
        return true;
      }
      return false;
    },
    close() {
      setState(null);
    },
  }));

  if (!state || state.items.length === 0) return null;

  const { top, left, height = 20 } = { ...state.coords, height: 20 };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: top + height + 4,
        left,
        zIndex: 9999,
        minWidth: 220,
        maxHeight: 320,
        overflowY: "auto",
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      {state.items.map((item, i) => (
        <button
          key={item.title}
          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/10 transition-colors"
          style={{
            background: i === state.selectedIndex ? "rgba(168,145,217,0.2)" : undefined,
            color: "var(--foreground)",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            state.command(item);
          }}
        >
          <span
            className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold shrink-0"
            style={{ background: "rgba(128,128,128,0.1)", color: "var(--accent)" }}
          >
            {item.icon}
          </span>
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{item.description}</p>
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
});

SlashMenu.displayName = "SlashMenu";
export default SlashMenu;
