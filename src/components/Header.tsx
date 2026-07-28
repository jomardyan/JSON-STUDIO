import React from 'react';
import {
  Moon,
  Sun,
  History,
  FolderOpen,
  Settings,
  ShieldCheck,
  ChevronDown,
  Terminal,
  Download,
  Languages,
  Rocket,
  Github,
  Database,
  GitCompare,
  Wand2,
  Code2,
  FileDiff,
  FileCode2,
  KeyRound,
  Network,
  BarChart3,
  FolderArchive,
  Globe,
  FileSpreadsheet,
  FileText,
  TableIcon,
  Code,
  Boxes,
  Sparkles,
  Keyboard,
  Search,
} from 'lucide-react';
import { Theme } from '../types';
import { SAMPLE_DATASETS, SampleItem } from '../utils/samples';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenChangelog?: () => void;
  onOpenShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
  version?: string;
  onSelectSample: (sample: SampleItem) => void;
  showInstallButton?: boolean;
  onInstallClick?: () => void;
  // Developer Tool Modals
  onOpenSqlStudio?: () => void;
  onOpenDiff?: () => void;
  onOpenTransformTools?: () => void;
  onOpenCodeGenerator?: () => void;
  onOpenJq?: () => void;
  onOpenPatch?: () => void;
  onOpenApiSpec?: () => void;
  onOpenJwt?: () => void;
  onOpenObjectGraph?: () => void;
  onOpenProfiler?: () => void;
  onOpenBatch?: () => void;
  onOpenUrlFetcher?: () => void;
  onOpenCharts?: () => void;
  onOpenLlmSpec?: () => void;
  // Converters
  onRunFormat?: (action: string) => void;
  onRunCrossConversion?: (from: string, to: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  historyCount,
  onOpenHistory,
  onOpenSettings,
  onOpenChangelog,
  onOpenShortcuts,
  onOpenCommandPalette,
  version = 'v2.6.0',
  onSelectSample,
  showInstallButton,
  onInstallClick,
  onOpenSqlStudio,
  onOpenDiff,
  onOpenTransformTools,
  onOpenCodeGenerator,
  onOpenJq,
  onOpenPatch,
  onOpenApiSpec,
  onOpenJwt,
  onOpenObjectGraph,
  onOpenProfiler,
  onOpenBatch,
  onOpenUrlFetcher,
  onOpenCharts,
  onOpenLlmSpec,
  onRunFormat,
  onRunCrossConversion,
}) => {
  const [showToolsMenu, setShowToolsMenu] = React.useState(false);
  const [showConvertersMenu, setShowConvertersMenu] = React.useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = React.useState(false);
  const [showLangMenu, setShowLangMenu] = React.useState(false);

  const t = getTranslation(language);

  const toggleTheme = () => {
    if (theme === 'dark') onThemeChange('light');
    else onThemeChange('dark');
  };

  const languageLabels: Record<SupportedLanguage, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇬🇧' },
    pl: { name: 'Polski', flag: '🇵🇱' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
  };

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-50 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-100 dark:text-zinc-900 shadow-xs font-mono font-bold text-xs shrink-0">
            <Terminal className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
          </div>
          
          <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans flex items-center gap-1.5">
            <span>JSON</span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-medium">
              Studio Pro
            </span>
          </h1>

          {/* Quick Command Palette Search Trigger Button */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-lg border border-zinc-200 dark:border-zinc-700/80 transition-colors cursor-pointer ml-2"
              title="Search features & commands (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>Search features...</span>
              <kbd className="px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          )}
        </div>

        {/* Center Top Navbar - Submenu Tools & Categories */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Tools & Studios Navbar Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowToolsMenu(!showToolsMenu);
                setShowConvertersMenu(false);
                setShowSamplesMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showToolsMenu
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-indigo-500" />
              <span>Developer Studios</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${showToolsMenu ? 'rotate-180' : ''}`} />
            </button>

            {showToolsMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowToolsMenu(false)} />
                <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="pb-2">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center justify-between">
                      <span>Developer Tools Suite</span>
                      <span className="text-[9px] font-normal text-zinc-400">12 Studios</span>
                    </div>

                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      {onOpenSqlStudio && (
                        <button
                          onClick={() => { onOpenSqlStudio(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <Database className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">SQL Studio & Generator</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">DDL CREATE TABLE & Batch INSERTs</div>
                          </div>
                        </button>
                      )}

                      {onOpenDiff && (
                        <button
                          onClick={() => { onOpenDiff(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <GitCompare className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Side-by-Side JSON Diff</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Compare objects & highlight deltas</div>
                          </div>
                        </button>
                      )}

                      {onOpenTransformTools && (
                        <button
                          onClick={() => { onOpenTransformTools(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-violet-50/80 dark:hover:bg-violet-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                            <Wand2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Case / PII Mask / JSONPath</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Transform keys & sanitize data</div>
                          </div>
                        </button>
                      )}

                      {onOpenCodeGenerator && (
                        <button
                          onClick={() => { onOpenCodeGenerator(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Code2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Multi-Lang Code Generator</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">TS, Python, Go, Rust, C#, Swift</div>
                          </div>
                        </button>
                      )}

                      {onOpenJq && (
                        <button
                          onClick={() => { onOpenJq(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-teal-50/80 dark:hover:bg-teal-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <Terminal className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">jq Query Playground</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Run custom UNIX jq expressions</div>
                          </div>
                        </button>
                      )}

                      {onOpenPatch && (
                        <button
                          onClick={() => { onOpenPatch(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                            <FileDiff className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">JSON Patch & Merge Patch</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">RFC 6902 & RFC 7386 specs</div>
                          </div>
                        </button>
                      )}

                      {onOpenApiSpec && (
                        <button
                          onClick={() => { onOpenApiSpec(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-orange-50/80 dark:hover:bg-orange-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                            <FileCode2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">OpenAPI / cURL / GraphQL Specs</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Export API schemas & commands</div>
                          </div>
                        </button>
                      )}

                      {onOpenJwt && (
                        <button
                          onClick={() => { onOpenJwt(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <KeyRound className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">JWT Inspector & Claims</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Decode tokens & check claims</div>
                          </div>
                        </button>
                      )}

                      {onOpenObjectGraph && (
                        <button
                          onClick={() => { onOpenObjectGraph(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <Network className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Interactive ER & Object Graph</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Visual parent-child node graph</div>
                          </div>
                        </button>
                      )}

                      {onOpenProfiler && (
                        <button
                          onClick={() => { onOpenProfiler(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Payload Profiler & Stats</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Inspect structure, types & depth</div>
                          </div>
                        </button>
                      )}

                      {onOpenBatch && (
                        <button
                          onClick={() => { onOpenBatch(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50/80 dark:hover:bg-amber-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <FolderArchive className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Multi-file Batch Processor</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Batch convert multiple files</div>
                          </div>
                        </button>
                      )}

                      {onOpenUrlFetcher && (
                        <button
                          onClick={() => { onOpenUrlFetcher(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-sky-50/80 dark:hover:bg-sky-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">URL & API Endpoint Fetcher</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Fetch live JSON from remote APIs</div>
                          </div>
                        </button>
                      )}

                      {onOpenCharts && (
                        <button
                          onClick={() => { onOpenCharts(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">Visual Analytics & Charts</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Interactive Bar, Line & Pie graphs</div>
                          </div>
                        </button>
                      )}

                      {onOpenLlmSpec && (
                        <button
                          onClick={() => { onOpenLlmSpec(); setShowToolsMenu(false); }}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-50/80 dark:hover:bg-purple-950/40 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <div className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">AI / LLM Structured Spec</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400">OpenAI, Gemini & Zod schemas</div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Converters Navbar Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowConvertersMenu(!showConvertersMenu);
                setShowToolsMenu(false);
                setShowSamplesMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showConvertersMenu
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Converters</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${showConvertersMenu ? 'rotate-180' : ''}`} />
            </button>

            {showConvertersMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowConvertersMenu(false)} />
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="pb-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                      Standard Exporters
                    </div>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      <button
                        onClick={() => { onRunFormat?.('to-csv'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                          JSON ➔ CSV / Excel
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.csv</span>
                      </button>

                      <button
                        onClick={() => { onRunFormat?.('to-xml'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <FileText className="w-3.5 h-3.5 text-sky-500" />
                          JSON ➔ XML
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.xml</span>
                      </button>

                      <button
                        onClick={() => { onRunFormat?.('to-yaml'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <FileCode2 className="w-3.5 h-3.5 text-teal-500" />
                          JSON ➔ YAML
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.yaml</span>
                      </button>

                      <button
                        onClick={() => { onRunFormat?.('to-sql'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Database className="w-3.5 h-3.5 text-indigo-500" />
                          JSON ➔ SQL Script
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.sql</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                      Code & Documentation
                    </div>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      <button
                        onClick={() => { onRunCrossConversion?.('json', 'markdown'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <TableIcon className="w-3.5 h-3.5 text-indigo-500" />
                          JSON ➔ Markdown Table
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.md</span>
                      </button>

                      <button
                        onClick={() => { onRunCrossConversion?.('json', 'ndjson'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <FileCode2 className="w-3.5 h-3.5 text-emerald-500" />
                          JSON ➔ NDJSON / JSON Lines
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.jsonl</span>
                      </button>

                      <button
                        onClick={() => { onRunCrossConversion?.('json', 'python'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Code className="w-3.5 h-3.5 text-amber-500" />
                          JSON ➔ Python Dict
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.py</span>
                      </button>

                      <button
                        onClick={() => { onRunCrossConversion?.('json', 'php'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Code className="w-3.5 h-3.5 text-purple-500" />
                          JSON ➔ PHP Array
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.php</span>
                      </button>

                      <button
                        onClick={() => { onRunFormat?.('to-html'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <TableIcon className="w-3.5 h-3.5 text-blue-500" />
                          JSON ➔ HTML Table
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.html</span>
                      </button>

                      <button
                        onClick={() => { onRunFormat?.('to-typescript'); setShowConvertersMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <Code2 className="w-3.5 h-3.5 text-sky-500" />
                          JSON ➔ TypeScript Types
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">.ts</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sample Data Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSamplesMenu(!showSamplesMenu);
                setShowToolsMenu(false);
                setShowConvertersMenu(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showSamplesMenu
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={t.samples}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.samples}</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-150 ${showSamplesMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSamplesMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSamplesMenu(false)} />
                <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                  {(['Core JSON', 'Conversions', 'Dev Tools', 'AI & Analytics'] as const).map((cat) => {
                    const catSamples = SAMPLE_DATASETS.filter((s) => s.category === cat);
                    if (catSamples.length === 0) return null;
                    return (
                      <div key={cat} className="py-1.5 first:pt-0 last:pb-0">
                        <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {cat}
                        </div>
                        <div className="space-y-0.5 mt-0.5">
                          {catSamples.map((sample) => (
                            <button
                              key={sample.id}
                              onClick={() => {
                                onSelectSample(sample);
                                setShowSamplesMenu(false);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex flex-col gap-0.5 transition-colors cursor-pointer group"
                            >
                              <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sample.name}</span>
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  {sample.format}
                                </span>
                              </div>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                {sample.description}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Controls Area */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
            title={t.history}
          >
            <History className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">{t.history}</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-indigo-600 text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Keyboard Shortcuts Button */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Keyboard Shortcuts Cheat Sheet (Ctrl+/)"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          )}

          {/* GitHub Open Source Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-2xs"
            title="View Open Source Repository on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              title={t.languageSelect}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-mono uppercase">{languageLabels[language].flag} {language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 py-1 text-xs">
                  {(Object.keys(languageLabels) as SupportedLanguage[]).map((langKey) => (
                    <button
                      key={langKey}
                      onClick={() => {
                        onLanguageChange(langKey);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                        language === langKey
                          ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                          : 'text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{languageLabels[langKey].flag}</span>
                        <span>{languageLabels[langKey].name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          {showInstallButton && (
            <button
              onClick={onInstallClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer shadow-2xs"
              title={t.installApp}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.installApp}</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700/80 transition-colors cursor-pointer"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700/80 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


