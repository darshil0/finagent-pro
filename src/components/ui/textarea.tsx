"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.ComponentProps<"textarea"> {
  autosize?: boolean;
  placeholderVariant?: "default" | "qa" | "compliance";
  maxRows?: number;
  minRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      autosize = false,
      placeholderVariant = "default",
      maxRows = 10,
      minRows = 3,
      rows,
      placeholder,
      ...props
    },
    ref
  ) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const [rowCount, setRowCount] = React.useState(minRows);

    // QA Autosizing logic
    React.useEffect(() => {
      if (!autosize || !textAreaRef.current) return;

      const textarea = textAreaRef.current;
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const newRows = Math.min(
        Math.max(Math.floor(scrollHeight / 24), minRows),
        maxRows
      );
      setRowCount(newRows);
    }, [autosize, minRows, maxRows]);

    const getQaPlaceholder = (basePlaceholder: string | undefined) => {
      switch (placeholderVariant) {
        case "qa":
          return basePlaceholder || "Enter QA test query (e.g., 'validate Nvidia API response time')";
        case "compliance":
          return basePlaceholder || "HIPAA/GDPR compliant input required";
        default:
          return basePlaceholder || "Enter your message...";
      }
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        (textAreaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    return (
      <textarea
        ref={setRefs}
        data-slot="textarea"
        className={cn(
          // QA Dashboard Glassmorphism
          "glass-card w-full resize-none rounded-2xl border-0 bg-slate-900/50 backdrop-blur-xl text-slate-100 placeholder-slate-500 focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:shadow-sky-500/25 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-sky-500/30",
          
          // Sizing
          "px-4 py-4 text-base md:text-sm min-h-[72px]",
          autosize ? "overflow-hidden" : "overflow-auto",
          
          // States
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-900/30",
          "aria-invalid:border-destructive/50 aria-invalid:ring-destructive/30 aria-invalid:bg-destructive/5",
          
          className
        )}
        rows={autosize ? undefined : (rows || minRows)}
        placeholder={getQaPlaceholder(placeholder)}
        style={autosize ? { height: `${rowCount * 24}px` } : undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
