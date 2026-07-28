import React from 'react';
import { X, Sparkles, Tag, CheckCircle2, Calendar, ShieldCheck, Rocket, Code2 } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
  currentVersion?: string;
}

interface ReleaseEntry {
  version: string;
  date: string;
  badge: 'Latest' | 'Major' | 'Feature';
  badgeColor: string;
  changes: {
    category: string;
    items: string[];
  }[];
}

const CHANGELOG_RELEASES: ReleaseEntry[] = [
  {
    version: 'v2.7.0',
    date: 'July 28, 2026',
    badge: 'Latest',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    changes: [
      {
        category: 'Spotlight Command Palette & Function Search (Ctrl+K)',
        items: [
          'Added VS Code-style Spotlight Command Palette (Ctrl+K / Cmd+K) for instant fuzzy search across 45+ capabilities, formatters, converters, developer tools, and sample datasets.',
          'Full keyboard arrow key navigation (Up/Down), Enter execution, and Esc dismissal.',
          'Quick search trigger button added to top navigation header.'
        ]
      },
      {
        category: 'Visual Analytics & AI Tool Spec Generators',
        items: [
          'Chart Studio: Render interactive Bar, Line, Area, and Pie charts directly from JSON datasets.',
          'AI / LLM Spec Generator: Generate OpenAI function declarations, Gemini tool specs, Zod schemas, and TypeBox types from JSON payloads.'
        ]
      },
      {
        category: 'User Experience (UX) & Editor Enhancements',
        items: [
          'Added Keyboard Shortcuts Cheat Sheet modal (Ctrl+/) and hotkeys (Ctrl+Enter Format, Ctrl+Shift+M Minify, Ctrl+Shift+R Repair, Ctrl+Shift+X Swap).',
          'Empty editor quick-start chips with 1-click sample loads and clipboard paste.',
          '1-Click Swap (⇄) button to feed output conversion results back into input for chained transformations.',
          'Real-time search match counter badge in output code view.'
        ]
      },
      {
        category: 'Array Utilities & Core Bug Fixes',
        items: [
          'Added Array Deduplication (dedupe-array) and multi-dimensional Array Flattening (flatten-nested-array).',
          'Fixed 13 parser & generator bugs including XML fallback regex statefulness, leading-zero number coercion, TOML dotted headers, and YAML string quoting.'
        ]
      }
    ]
  },
  {
    version: 'v2.6.0',
    date: 'July 28, 2026',
    badge: 'Major',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    changes: [
      {
        category: 'Toolbar Layout & Overlap Fixes',
        items: [
          'Unified developer utility buttons into a clean, non-overlapping Developer Tools dropdown menu.',
          'Elevated workspace z-indexing and relative positioning so dropdown popovers stay visible on high and low screen resolutions.',
          'Added keyboard accessibility and outside-click dismiss listeners.'
        ]
      },
      {
        category: 'Integrated Developer Studios Suite',
        items: [
          'Full integration of 12 modal studios: SQL Studio, JSON Side-by-Side Diff, PII Masking & JSONPath, Multi-Lang Code Models, jq Playground, RFC 6902 Patch, OpenAPI/cURL Specs, JWT Inspector, ER Graph, Payload Profiler, Batch Processor, and URL Fetcher.',
          'Direct payload injection from modals back into the main JSON Studio workspace.'
        ]
      }
    ]
  },
  {
    version: 'v2.5.0',
    date: 'July 20, 2026',
    badge: 'Major',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    changes: [
      {
        category: 'SEO & AI Crawler Readiness',
        items: [
          'Added sitemap.xml & robots.txt optimized for Google, Bing, and AI search bots (GPTBot, ClaudeBot, PerplexityBot).',
          'Created llms.txt & llms-full.txt machine-readable documentation manifests for AI agents.',
          'Implemented structured JSON-LD FAQ schema for rich search snippets.'
        ]
      },
      {
        category: 'Internationalization (i18n)',
        items: [
          'Added multi-language support: English, Polski (PL), Deutsch (DE), Español (ES), and Français (FR).',
          'Persisted language preferences across sessions in LocalStorage.'
        ]
      }
    ]
  },
  {
    version: 'v2.4.0',
    date: 'July 15, 2026',
    badge: 'Feature',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    changes: [
      {
        category: 'Universal Multi-Format Engine',
        items: [
          'Added cross-conversions between JSON, XML, CSV/TSV, YAML, TOML, SQL INSERT queries, Markdown tables, HTML tables, TypeScript interfaces, Python dicts, PHP arrays, NDJSON, and .env/Properties.',
          'Smart Auto-Deduct format detection upon pasting or typing.'
        ]
      },
      {
        category: 'Auto Repair Engine',
        items: [
          'Fixes unquoted keys, replaces single quotes, strips trailing commas, removes C-style inline/block comments, and normalizes Python boolean values.'
        ]
      }
    ]
  }
];

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  currentVersion = 'v2.7.0',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {t.changelogTitle}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {currentVersion}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.changelogSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Timeline */}
        <div className="p-5 overflow-y-auto space-y-6">
          {CHANGELOG_RELEASES.map((release) => (
            <div
              key={release.version}
              className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 last:border-l-transparent pb-2"
            >
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>

              {/* Version & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {release.version}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium font-mono rounded border ${release.badgeColor}`}
                  >
                    {release.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{release.date}</span>
                </div>
              </div>

              {/* Release Items */}
              <div className="space-y-3">
                {release.changes.map((group, idx) => (
                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800/60">
                    <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {group.category}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Privacy Guaranteed</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
