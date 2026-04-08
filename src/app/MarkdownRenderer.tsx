"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-slate-300 leading-relaxed my-3">{children}</p>,
          
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
                  <code className="text-slate-300 text-sm font-mono" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="bg-slate-800/50 text-sky-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },

          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-800 shadow-2xl">
              <table className="min-w-full divide-y divide-slate-800 bg-slate-900/40">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-800/60 uppercase text-xs tracking-wider">{children}</thead>,
          th: ({ children }) => (
            <th className="px-6 py-4 text-left font-bold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="px-6 py-4 text-sm text-slate-400 border-t border-slate-800/50">{children}</td>,
          
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-sky-500/50 pl-6 my-6 italic text-slate-400 bg-sky-500/5 py-1 rounded-r-lg">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-bold text-white shadow-sm">{children}</strong>,
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
