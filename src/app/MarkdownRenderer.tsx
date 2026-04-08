"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // --- CLEANING LOGIC ---
  // We strip out the <data> tags and their content so the user doesn't see 
  // raw JSON. The AnalysisResults component handles the actual chart rendering.
  const displayContent = content.replace(/<data>[\s\S]*?<\/data>/g, "").trim();

  return (
    <div className={`prose prose-invert prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-3xl font-bold text-white mt-6 mb-4">{children}</h1>,
          h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-2xl font-bold text-white mt-5 mb-3">{children}</h2>,
          h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h3>,
          p: ({ children }: { children?: React.ReactNode }) => <p className="text-slate-300 leading-relaxed my-3">{children}</p>,
          
          // Fix for the code block typing and rendering
          code({ inline, className, children, ...props }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
            [key: string]: unknown;
          }) {
            return !inline ? (
              <div className="relative group">
                <pre className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg overflow-x-auto my-4">
                  <code className={cn("text-slate-300 text-sm font-mono", className)} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={cn("bg-slate-800/50 text-sky-400 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props}>
                {children}
              </code>
            );
          },

          table: ({ children }: { children?: React.ReactNode }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 shadow-2xl">
              <table className="min-w-full divide-y divide-slate-800 bg-slate-900/40">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-slate-800/60 uppercase text-xs tracking-wider">{children}</thead>,
          th: ({ children }: { children?: React.ReactNode }) => (
            <th className="px-6 py-4 text-left font-bold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }: { children?: React.ReactNode }) => <td className="px-6 py-4 text-sm text-slate-400 border-t border-slate-800/50">{children}</td>,
          
          blockquote: ({ children }: { children?: React.ReactNode }) => (
            <blockquote className="border-l-4 border-sky-500/50 pl-6 my-6 italic text-slate-400 bg-sky-500/5 py-1 rounded-r-lg">
              {children}
            </blockquote>
          ),
          strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-white shadow-sm">{children}</strong>,
        } as any}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
