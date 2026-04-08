"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, Copy, Check, Terminal, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

interface QaError {
  message: string;
  stack?: string;
  digest?: string;
  timestamp: number;
  source: 'boundary' | 'runtime' | 'api' | 'test';
}

export default function QaErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [qaErrors, setQaErrors] = useState<QaError[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Performance-optimized error tracking
  const trackQaError = useCallback((errorData: QaError) => {
    if (!mountedRef.current) return;
    
    setQaErrors(prev => {
      // Avoid duplicate logs for the same error message within a 2-second window
      if (prev.length > 0 && prev[0].message === errorData.message) return prev;
      return [errorData, ...prev.slice(0, 9)];
    });
    
    console.error(`🧪 [QA_DIAGNOSTIC] ${errorData.source.toUpperCase()}:`, errorData.message);
  }, []);

  useEffect(() => {
    const handleRuntimeError = (event: ErrorEvent) => {
      trackQaError({
        message: event.message || "Unknown Runtime Exception",
        stack: event.error?.stack,
        timestamp: Date.now(),
        source: event.filename?.includes('test') ? 'test' : 'runtime'
      });
    };

    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      trackQaError({
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        timestamp: Date.now(),
        source: 'api'
      });
    };

    window.addEventListener('error', handleRuntimeError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleRuntimeError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      mountedRef.current = false;
    };
  }, [trackQaError]);

  // Sync the Next.js boundary error into our local QA state
  useEffect(() => {
    if (error) {
      const errorData: QaError = {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        timestamp: Date.now(),
        source: 'boundary'
      };

      const timeout = setTimeout(() => trackQaError(errorData), 0);
      return () => clearTimeout(timeout);
    }
  }, [error, trackQaError]);

  const copyErrorReport = (err: QaError) => {
    const report = `AI FinAgent QA Report\n${'='.repeat(20)}\nSource: ${err.source}\nMsg: ${err.message}\nDigest: ${err.digest || 'N/A'}\nStack: ${err.stack}`;
    navigator.clipboard.writeText(report).then(() => {
      setCopied(err.message);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (!error && !qaErrors.length) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl w-full bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-300">
        
        {/* Diagnostic Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-3 uppercase">Application Fault Detected</h1>
          <p className="text-slate-400 font-medium max-w-md">
            The QA framework intercepted a critical {error?.name || 'Exception'} that prevented the dashboard from rendering.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button 
            onClick={() => reset?.()}
            className="group relative flex items-center justify-center gap-3 h-14 bg-white text-slate-950 font-bold rounded-xl hover:bg-sky-400 transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Attempt Recovery
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-3 h-14 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
          >
            Hard Reload
          </button>
        </div>

        {/* QA Diagnostic Console */}
        <div className="rounded-2xl border border-slate-800 bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Diagnostic Logs</span>
            </div>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar">
            {qaErrors.map((err, i) => (
              <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-slate-900/50 border border-white/5 group relative">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 font-bold">[{err.source}]</span>
                  <button onClick={() => copyErrorReport(err)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied === err.message ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>
                <p className="text-slate-300 leading-relaxed">{err.message}</p>
                {err.digest && <p className="text-slate-500 italic">Digest: {err.digest}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            Secured Session • Healthcare Compliance v2.4 • Next.js 16.0.0-canary
          </p>
        </div>
      </div>
    </div>
  );
}
