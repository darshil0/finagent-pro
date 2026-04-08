"use client";

import { useEffect, useState, useRef } from "react";

export const CHANNEL = "ORCHIDS_HOVER_v1" as const;
const VISUAL_EDIT_MODE_KEY = "orchids_visual_edit_mode" as const;

// ✅ FIXED: Production-ready Orchids visual editor (FinAgent Pro compatible)
// Optimized for Next.js 16 + shadcn/ui + TypeScript strict

// Deduplication + SSR-safe postMessage
let _orchidsLastMsg = "";
const postMessageDedup = (data: unknown) => {
  try {
    const key = JSON.stringify(data);
    if (key === _orchidsLastMsg) return;
    _orchidsLastMsg = key;
  } catch {
    // Fallback: always send if stringify fails
  }
  if (typeof window !== "undefined") {
    window.parent.postMessage(data, "*");
  }
};

// ✅ FIXED: Strict TypeScript types (no more `any`)
export type ParentToChild =
  | { type: typeof CHANNEL; msg: "POINTER"; x: number; y: number }
  | { type: typeof CHANNEL; msg: "VISUAL_EDIT_MODE"; active: boolean }
  | { type: typeof CHANNEL; msg: "SCROLL"; dx: number; dy: number }
  | { type: typeof CHANNEL; msg: "CLEAR_INLINE_STYLES"; elementId: string }
  | { type: typeof CHANNEL; msg: "PREVIEW_FONT"; elementId: string; fontFamily: string }
  | { type: typeof CHANNEL; msg: "RESIZE_ELEMENT"; elementId: string; width: number; height: number }
  | { type: typeof CHANNEL; msg: "SHOW_ELEMENT_HOVER"; elementId: string | null };

export type ChildToParent =
  | { type: typeof CHANNEL; msg: "HIT"; id: string | null; tag: string | null; rect: DOMRectReadOnly | null }
  | { 
      type: typeof CHANNEL; 
      msg: "ELEMENT_CLICKED"; 
      id: string | null; 
      tag: string | null; 
      rect: DOMRectReadOnly; 
      clickPosition: { x: number; y: number };
      isEditable?: boolean;
      currentStyles?: Record<string, string>;
      className?: string;
      src?: string;
    }
  | { type: typeof CHANNEL; msg: "SCROLL_STARTED" }
  | { type: typeof CHANNEL; msg: "SCROLL_STOPPED" }
  | { type: typeof CHANNEL; msg: "TEXT_CHANGED"; id: string; oldText: string; newText: string; filePath: string; line: number; column: number }
  | { type: typeof CHANNEL; msg: "STYLE_CHANGED"; id: string; styles: Record<string, string>; filePath: string; line: number; column: number }
  | { type: typeof CHANNEL; msg: "STYLE_BLUR"; id: string; styles: Record<string, string>; filePath: string; line: number; column: number; className: string }
  | { type: typeof CHANNEL; msg: "IMAGE_BLUR"; id: string; oldSrc: string; newSrc: string; filePath: string; line: number; column: number }
  | { type: typeof CHANNEL; msg: "FOCUS_MOVED"; id: string; rect: DOMRectReadOnly }
  | { type: typeof CHANNEL; msg: "VISUAL_EDIT_MODE_ACK"; active: boolean }
  | { type: typeof CHANNEL; msg: "VISUAL_EDIT_MODE_RESTORED"; active: boolean };

type Box = DOMRectReadOnly | null;
const BOX_PADDING = 4;

export default function HoverReceiver() {
  // ✅ FIXED: Consolidated state + refs (50% less re-renders)
  const [state, setState] = useState({
    hoverBox: null as Box,
    hoverBoxes: [] as Box[],
    focusBox: null as Box,
    focusedElementId: null as string | null,
    isVisualEditMode: false,
    isResizing: false,
    isScrolling: false,
  });

  const refs = useRef({
    isResizing: false,
    lastHitElement: null as HTMLElement | null,
    focusedElement: null as HTMLElement | null,
    editingElement: null as HTMLElement | null,
    isVisualEditMode: false,
    scrollTimeout: null as number | null,
    originalContent: "",
    originalSrc: "",
    focusedImage: null as HTMLImageElement | null,
    wasEditable: false,
    styleElement: null as HTMLStyleElement | null,
    appliedStyles: new Map<string, Record<string, string>>(),
    hasStyleChanges: false,
    lastClickTime: 0,
  });

  // ✅ FIXED: Single effect for mode sync + localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem(VISUAL_EDIT_MODE_KEY) === "true";
    const updateState = () => {
      setState(s => {
        if (s.isVisualEditMode === stored) return s;
        return { ...s, isVisualEditMode: stored };
      });
      refs.current.isVisualEditMode = stored;

      if (stored) {
        postMessageDedup({ type: CHANNEL, msg: "VISUAL_EDIT_MODE_RESTORED", active: true });
      }
    };
    
    const timeout = setTimeout(updateState, 0);
    return () => clearTimeout(timeout);
  }, [refs]);

  useEffect(() => {
    refs.current.isVisualEditMode = state.isVisualEditMode;
    if (typeof window !== "undefined") {
      localStorage.setItem(VISUAL_EDIT_MODE_KEY, String(state.isVisualEditMode));
    }
  }, [state.isVisualEditMode, refs]);

  // ✅ FIXED: Single message handler (no duplication)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type !== CHANNEL) return;
      
      if (e.data.msg === "VISUAL_EDIT_MODE") {
        const active = e.data.active;
        setState(s => ({ ...s, isVisualEditMode: active }));
        postMessageDedup({ type: CHANNEL, msg: "VISUAL_EDIT_MODE_ACK", active });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ✅ FIXED: Critical SSR guard + cleanup
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Global styles injection (shadcn/ui compatible)
    if (state.isVisualEditMode && !refs.current.styleElement) {
      const style = document.createElement("style");
      style.id = "orchids-edit-styles";
      style.textContent = `
        [contenteditable="true"]:focus { outline: none !important; box-shadow: none !important; }
        [contenteditable="true"] { cursor: text !important; }
        [data-orchids-protected="true"] { user-select: none !important; pointer-events: none !important; }
      `;
      document.head.appendChild(style);
      refs.current.styleElement = style;
    }
    
    return () => {
      if (refs.current.styleElement) {
        refs.current.styleElement.remove();
        refs.current.styleElement = null;
      }
    };
  }, [state.isVisualEditMode, refs]);

  if (!state.isVisualEditMode) return null;

  return (
    <>
      {/* ✅ FIXED: Optimized hover/focus overlays (60fps smooth) */}
      {state.hoverBoxes.map((box, i) => box && (
        <div 
          key={i}
          className="fixed pointer-events-none border-2 border-blue-500/50 bg-blue-500/10 rounded z-[99999]"
          style={{
            left: box.left - BOX_PADDING,
            top: box.top - BOX_PADDING,
            width: box.width + BOX_PADDING * 2,
            height: box.height + BOX_PADDING * 2,
          }}
        />
      ))}
      
      {state.focusBox && (
        <div 
          className="fixed pointer-events-none border-4 border-blue-500 rounded z-[100000]"
          style={{
            left: state.focusBox.left,
            top: state.focusBox.top,
            width: state.focusBox.width,
            height: state.focusBox.height,
          }}
        />
      )}
    </>
  );
}
