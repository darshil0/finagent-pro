"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, History, Send, Loader2, 
  BrainCircuit, Trash2, Copy, Check, AlertCircle 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { analyzeFinancialDataAction } from './actions';

/**
 * Lazy-loaded components for improved initial page load
 * Follows Google Performance Best Practices
 */
const Charts = dynamic(() => import('./Charts'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />
});

const MarkdownRenderer = dynamic(() => import('./MarkdownRenderer'), { 
  ssr: false,
  loading: () => <LoadingSkeleton />
});

/** Type definitions following Google TypeScript Style Guide */
export interface ChartDataItem {
  readonly name: string;
  readonly value: number;
  [key: string]: string | number | undefined;
}

interface ChartData {
  readonly type: 'trend' | 'sector' | 'heatmap';
  readonly items: ChartDataItem[];
}

interface HistoryItem {
  readonly id: string;
  readonly query: string;
  readonly response: string;
  readonly timestamp: number;
  readonly data?: ChartData;
  readonly requestId?: string;
}

interface MarketPrices {
  readonly btc: number;
  readonly spy: number;
}

/** Constants */
const STORAGE_KEY = 'finagent_qa_history' as const;
const MAX_HISTORY_ITEMS = 50 as const;
const MARKET_UPDATE_INTERVAL = 10000 as const; // 10 seconds
const DEBOUNCE_DELAY = 300 as const;

/**
 * Custom hook for localStorage with SSR safety
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        // Delay to avoid synchronous setState in effect
        setTimeout(() => setStoredValue(parsed), 0);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Debounce utility for optimizing frequent operations
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Loading skeleton component
 */
const LoadingSkeleton = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Main Financial Agent QA Dashboard Component
 * 
 * Features:
 * - Real-time market data simulation
 * - Persistent query history
 * - AI-powered financial analysis
 * - Responsive design with accessibility
 * 
 * Performance Optimizations:
 * - Code splitting with dynamic imports
 * - Memoized expensive computations
 * - Debounced search operations
 * - Efficient re-render prevention
 */
export default function FinAgentQADashboard(): React.JSX.Element {
  // State management
  const [query, setQuery] = useState('');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ 
    btc: 96412, 
    spy: 591.2 
  });

  // Custom hooks
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(STORAGE_KEY, []);
  const debouncedSearch = useDebouncedValue(sidebarSearch, DEBOUNCE_DELAY);

  // Refs for cleanup and optimization
  const mountedRef = useRef(true);
  const marketIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (marketIntervalRef.current) {
        clearInterval(marketIntervalRef.current);
      }
    };
  }, []);

  /**
   * Market price simulator
   * Simulates realistic market fluctuations
   */
  useEffect(() => {
    marketIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      setMarketPrices(prev => ({
        btc: Math.max(50000, prev.btc + (Math.random() - 0.5) * 100),
        spy: Math.max(400, prev.spy + (Math.random() - 0.5) * 0.5)
      }));
    }, MARKET_UPDATE_INTERVAL);

    return () => {
      if (marketIntervalRef.current) {
        clearInterval(marketIntervalRef.current);
      }
    };
  }, []);

  /**
   * Filtered history with memoization
   * Prevents unnecessary re-computations
   */
  const filteredHistory = useMemo(() => 
    history.filter(item => 
      item.query.toLowerCase().includes(debouncedSearch.toLowerCase())
    ),
    [history, debouncedSearch]
  );

  /**
   * Chart data validation with error handling
   */
  const validateChartData = useCallback((text: string): ChartData | null => {
    try {
      const dataMatch = text.match(/<data>([\s\S]*?)<\/data>/);
      if (!dataMatch?.[1]) return null;
      
      const cleanedJson = dataMatch[1]
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      
      const data = JSON.parse(cleanedJson);
      
      if (!data?.items?.length || !data.type) return null;
      
      const validItems = data.items.filter((item: unknown) => 
        item && 
        typeof item === 'object' && 
        'name' in item && 
        'value' in item &&
        typeof (item as ChartDataItem).value === 'number' &&
        isFinite((item as ChartDataItem).value)
      ) as ChartDataItem[];
      
      if (validItems.length === 0) return null;
      
      return { 
        type: data.type as 'trend' | 'sector' | 'heatmap', 
        items: [...validItems]
      };
    } catch (error) {
      console.warn('Chart data validation failed:', error);
      return null;
    }
  }, []);

  /**
   * Main search handler with comprehensive error handling
   */
  const handleSearch = useCallback(async (
    event: React.FormEvent | null,
    customQuery?: string
  ): Promise<void> => {
    event?.preventDefault();
    
    const activeQuery = (customQuery || query).trim();
    if (!activeQuery || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeFinancialDataAction(activeQuery);
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      if (result.data) {
        const chartData = validateChartData(result.data);
        const newItem: HistoryItem = {
          id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          query: activeQuery,
          response: result.data,
          timestamp: Date.now(),
          data: chartData ?? undefined,
          requestId: result.requestId
        };

        if (mountedRef.current) {
          setHistory([newItem, ...history.slice(0, MAX_HISTORY_ITEMS - 1)]);
          setCurrentAnalysis(newItem);
          setQuery('');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Analysis request failed';
      
      console.error('Search error:', err);
      setError(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [query, loading, validateChartData, setHistory]);

  /**
   * Clear all history with confirmation
   */
  const clearHistory = useCallback(() => {
    if (!mountedRef.current) return;
    
    if (confirm('Clear all QA test history? This action cannot be undone.')) {
      setHistory([]);
      setCurrentAnalysis(null);
    }
  }, [setHistory]);

  /**
   * Copy to clipboard with feedback
   */
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  /**
   * Error state UI
   */
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center p-8 max-w-md">
          <div className="w-24 h-24 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-400 rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 border-r border-slate-800/50 bg-slate-900/80 backdrop-blur-xl flex flex-col hidden lg:flex"
        role="complementary"
        aria-label="QA Test History"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              AI FinAgent <span className="text-sm font-normal text-slate-400">QA</span>
            </h1>
          </div>
          
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                placeholder="Search QA tests..." 
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-sky-500/50 focus:border-transparent text-sm"
                aria-label="Search test history"
              />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              <AnimatePresence>
                {filteredHistory.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      currentAnalysis?.id === item.id
                        ? 'bg-sky-500/20 border-2 border-sky-500/50 shadow-lg'
                        : 'hover:bg-slate-800/50 border border-transparent'
                    }`}
                    aria-pressed={currentAnalysis?.id === item.id}
                    aria-label={`Test: ${item.query}`}
                  >
                    <p className="font-medium text-sm truncate">{item.query}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </motion.button>
                ))}
              </AnimatePresence>
              
              {filteredHistory.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">
                  {sidebarSearch ? "No QA tests found" : "Run your first QA test"}
                </p>
              )}
            </div>

            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="w-full mt-4 p-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all flex items-center justify-center gap-2"
                aria-label="Clear all test history"
              >
                <Trash2 className="w-3 h-3" /> Clear History ({history.length})
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-mono text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>QA Live</span>
            </div>
            <div className="text-xs text-slate-500">|</div>
            <div className="flex gap-4 text-sm">
              <span>BTC: ${marketPrices.btc.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              <span>SPY: ${marketPrices.spy.toFixed(2)}</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {!currentAnalysis && !loading && (
              <WelcomeScreen onQuickTest={handleSearch} />
            )}

            {loading && <LoadingScreen />}

            {currentAnalysis && (
              <AnalysisResults 
                analysis={currentAnalysis}
                onCopy={copyToClipboard}
                copied={copied}
              />
            )}
          </div>
        </div>

        {/* Fixed input bar */}
        <div className="border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-xl p-6">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter QA test query (e.g., 'test Nvidia API response')"
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent text-lg placeholder-slate-500"
                disabled={loading}
                aria-label="QA test input"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Test
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

/**
 * Welcome screen component
 */
const WelcomeScreen = memo(({ 
  onQuickTest 
}: { 
  onQuickTest: (e: React.FormEvent | null, query: string) => void 
}) => {
  const quickTests = [
    "Validate Nvidia API response",
    "Test healthcare compliance",
    "Check SPY market data accuracy"
  ];

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 pt-20">
      <div className="w-28 h-28 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center border border-sky-500/30">
        <BrainCircuit className="w-14 h-14 text-sky-400" />
      </div>
      <div>
        <h1 className="text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
          AI FinAgent QA
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Automated testing framework for AI financial agents with healthcare compliance validation
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 w-full max-w-3xl">
        {quickTests.map((test) => (
          <button
            key={test}
            onClick={() => onQuickTest(null, test)}
            className="group p-6 rounded-2xl border-2 border-slate-800/50 bg-slate-900/50 hover:border-sky-500/70 hover:bg-sky-500/5 transition-all shadow-xl hover:shadow-2xl"
          >
            <p className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors">
              {test}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

/**
 * Loading screen component
 */
const LoadingScreen = memo(() => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <Loader2 className="w-16 h-16 text-sky-400 animate-spin mb-8" />
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Running QA Tests</h2>
      <p className="text-slate-400">Validating API responses, compliance checks, and data integrity...</p>
    </div>
  </div>
));

LoadingScreen.displayName = 'LoadingScreen';

/**
 * Analysis results component
 */
const AnalysisResults = memo(({ 
  analysis, 
  onCopy, 
  copied 
}: { 
  analysis: HistoryItem; 
  onCopy: (text: string) => void;
  copied: boolean;
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">{analysis.query}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {new Date(analysis.timestamp).toLocaleString()}
          {analysis.requestId && ` • ID: ${analysis.requestId}`}
        </p>
      </div>
      <button
        onClick={() => onCopy(analysis.response)}
        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        aria-label="Copy analysis"
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <Copy className="w-5 h-5 text-slate-400" />
        )}
      </button>
    </div>

    <div className="glass-card p-6 rounded-2xl">
      <MarkdownRenderer content={analysis.response} />
    </div>

    {analysis.data && (
      <Charts type={analysis.data.type} items={analysis.data.items} />
    )}
  </div>
));

AnalysisResults.displayName = 'AnalysisResults';
