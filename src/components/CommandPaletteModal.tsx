import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  FileCode,
  Wrench,
  FileSpreadsheet,
  FileText,
  FileCode2,
  Database,
  GitCompare,
  Wand2,
  Code2,
  Terminal,
  FileDiff,
  KeyRound,
  Network,
  BarChart3,
  FolderArchive,
  Globe,
  Table as TableIcon,
  Code,
  ArrowUpDown,
  Eraser,
  Quote,
  Binary,
  Layers,
  FolderOpen,
  History,
  Settings,
  ShieldCheck,
  Command,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { SampleItem, SAMPLE_DATASETS } from '../utils/samples';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Actions' | 'Converters' | 'Dev Tools' | 'Samples' | 'Navigation';
  icon: React.ReactNode;
  keywords?: string[];
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunFormat: (action: string) => void;
  onRunCrossConversion: (from: string, to: string) => void;
  onOpenModal: (modalName: string) => void;
  onSelectSample: (sample: SampleItem) => void;
  onToggleTheme: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onRunFormat,
  onRunCrossConversion,
  onOpenModal,
  onSelectSample,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    // -----------------------------------------------------------------
    // 1. Actions & Formatting
    // -----------------------------------------------------------------
    {
      id: 'act-format',
      title: 'Format & Beautify JSON',
      description: 'Pretty print JSON with custom indentation spacing',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl+Enter',
      keywords: ['beautify', 'indent', 'clean', 'prettify'],
      action: () => onRunFormat('format'),
    },
    {
      id: 'act-minify',
      title: 'Minify JSON',
      description: 'Strip all whitespace and linebreaks for high density output',
      category: 'Actions',
      icon: <FileCode className="w-4 h-4 text-zinc-500" />,
      shortcut: 'Ctrl+Shift+M',
      keywords: ['compress', 'compact', 'pack'],
      action: () => onRunFormat('minify'),
    },
    {
      id: 'act-repair',
      title: 'Auto-Repair JSON Syntax Errors',
      description: 'Fix unquoted keys, single quotes, Python booleans & trailing commas',
      category: 'Actions',
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
      shortcut: 'Ctrl+Shift+R',
      keywords: ['fix', 'clean', 'dirty', 'quotes', 'comments'],
      action: () => onRunFormat('repair'),
    },
    {
      id: 'act-sort-asc',
      title: 'Sort Object Keys (A ➔ Z)',
      description: 'Sort object keys recursively in alphabetical order',
      category: 'Actions',
      icon: <ArrowUpDown className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl+Shift+S',
      keywords: ['order', 'alphabetical', 'keys'],
      action: () => onRunFormat('sort-asc'),
    },
    {
      id: 'act-sort-desc',
      title: 'Sort Object Keys (Z ➔ A)',
      description: 'Sort object keys in reverse alphabetical order',
      category: 'Actions',
      icon: <ArrowUpDown className="w-4 h-4 text-indigo-500 rotate-180" />,
      keywords: ['reverse', 'order'],
      action: () => onRunFormat('sort-desc'),
    },
    {
      id: 'act-clean-nulls',
      title: 'Remove Nulls & Empty Values',
      description: 'Strip nulls, undefined, and empty string properties',
      category: 'Actions',
      icon: <Eraser className="w-4 h-4 text-rose-500" />,
      keywords: ['strip', 'purge', 'empty', 'undefined'],
      action: () => onRunFormat('clean'),
    },
    {
      id: 'act-escape',
      title: 'Escape JSON to String Literal',
      description: 'Escape quotes and linebreaks into a single string literal',
      category: 'Actions',
      icon: <Quote className="w-4 h-4 text-amber-500" />,
      keywords: ['string', 'literal', 'quotes', 'encode'],
      action: () => onRunFormat('escape'),
    },
    {
      id: 'act-unescape',
      title: 'Unescape String to Formatted JSON',
      description: 'Unescape double-escaped JSON string literals',
      category: 'Actions',
      icon: <Quote className="w-4 h-4 text-emerald-500" />,
      keywords: ['decode', 'string', 'raw'],
      action: () => onRunFormat('unescape'),
    },
    {
      id: 'act-b64-encode',
      title: 'Base64 Encode',
      description: 'Convert payload string to UTF-8 safe Base64 string',
      category: 'Actions',
      icon: <Binary className="w-4 h-4 text-sky-500" />,
      keywords: ['b64', 'binary', 'encode'],
      action: () => onRunFormat('b64-encode'),
    },
    {
      id: 'act-b64-decode',
      title: 'Base64 Decode',
      description: 'Decode Base64 string back to formatted JSON',
      category: 'Actions',
      icon: <Binary className="w-4 h-4 text-violet-500" />,
      keywords: ['b64', 'binary', 'decode'],
      action: () => onRunFormat('b64-decode'),
    },
    {
      id: 'act-flatten',
      title: 'Flatten Object Keys (Dot Notation)',
      description: 'Convert nested JSON into single-level dot.notation object',
      category: 'Actions',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      keywords: ['dot', 'path', 'flatten'],
      action: () => onRunFormat('flatten'),
    },
    {
      id: 'act-unflatten',
      title: 'Unflatten Dot Notation',
      description: 'Convert dot-notation keys back into nested JSON objects',
      category: 'Actions',
      icon: <Layers className="w-4 h-4 text-purple-500" />,
      keywords: ['dot', 'expand', 'nested'],
      action: () => onRunFormat('unflatten'),
    },
    {
      id: 'act-schema',
      title: 'Generate JSON Schema (Draft-07)',
      description: 'Build compliant Draft-07 JSON Schema specification',
      category: 'Actions',
      icon: <FileCode2 className="w-4 h-4 text-blue-500" />,
      keywords: ['spec', 'draft-07', 'types', 'validation'],
      action: () => onRunFormat('to-schema'),
    },
    {
      id: 'act-dedupe',
      title: 'Deduplicate Array Items',
      description: 'Remove duplicate elements from a JSON array',
      category: 'Actions',
      icon: <Eraser className="w-4 h-4 text-purple-500" />,
      keywords: ['unique', 'array', 'duplicates', 'filter'],
      action: () => onRunFormat('dedupe-array'),
    },

    // -----------------------------------------------------------------
    // 2. Converters
    // -----------------------------------------------------------------
    {
      id: 'conv-matrix',
      title: '14x14 Conversion Compatibility Matrix',
      description: 'Interactive matrix showing format loss assessments & 1-click conversions',
      category: 'Converters',
      icon: <TableIcon className="w-4 h-4 text-indigo-500" />,
      keywords: ['matrix', 'compatibility', 'formats', 'lossy', 'lossless'],
      action: () => onOpenModal('matrix'),
    },
    {
      id: 'conv-csv',
      title: 'JSON ➔ CSV / Excel Spreadsheet',
      description: 'Convert JSON array to comma-separated values file',
      category: 'Converters',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />,
      keywords: ['excel', 'sheets', 'comma', 'table'],
      action: () => onRunFormat('to-csv'),
    },
    {
      id: 'conv-xml',
      title: 'JSON ➔ XML Document',
      description: 'Convert JSON to XML markup with custom root tags',
      category: 'Converters',
      icon: <FileText className="w-4 h-4 text-sky-500" />,
      keywords: ['markup', 'nodes', 'attributes'],
      action: () => onRunFormat('to-xml'),
    },
    {
      id: 'conv-yaml',
      title: 'JSON ➔ YAML Manifest',
      description: 'Convert JSON to clean YAML format',
      category: 'Converters',
      icon: <FileCode2 className="w-4 h-4 text-teal-500" />,
      keywords: ['k8s', 'docker', 'config', 'yml'],
      action: () => onRunFormat('to-yaml'),
    },
    {
      id: 'conv-sql',
      title: 'JSON ➔ SQL Script',
      description: 'Generate CREATE TABLE DDL & batch INSERT INTO statements',
      category: 'Converters',
      icon: <Database className="w-4 h-4 text-amber-500" />,
      keywords: ['database', 'mysql', 'postgres', 'sqlite', 'insert'],
      action: () => onRunFormat('to-sql'),
    },
    {
      id: 'conv-toml',
      title: 'JSON ➔ TOML Configuration',
      description: 'Convert JSON to TOML table & scalar key-values',
      category: 'Converters',
      icon: <FileCode2 className="w-4 h-4 text-rose-500" />,
      keywords: ['cargo', 'pyproject', 'config'],
      action: () => onRunFormat('to-toml'),
    },
    {
      id: 'conv-html',
      title: 'JSON ➔ HTML Table',
      description: 'Render JSON array into styled <table> HTML markup',
      category: 'Converters',
      icon: <TableIcon className="w-4 h-4 text-blue-500" />,
      keywords: ['web', 'table', 'markup'],
      action: () => onRunFormat('to-html'),
    },
    {
      id: 'conv-markdown',
      title: 'JSON ➔ Markdown Table',
      description: 'Generate GitHub Flavored Markdown table for documentation',
      category: 'Converters',
      icon: <FileText className="w-4 h-4 text-zinc-500" />,
      keywords: ['gfm', 'github', 'readme', 'doc'],
      action: () => onRunCrossConversion('json', 'markdown'),
    },
    {
      id: 'conv-ts',
      title: 'JSON ➔ TypeScript Interfaces',
      description: 'Generate TypeScript interface definitions from JSON structure',
      category: 'Converters',
      icon: <Code2 className="w-4 h-4 text-sky-500" />,
      keywords: ['types', 'ts', 'typing', 'models'],
      action: () => onRunFormat('to-ts-interface'),
    },
    {
      id: 'conv-ndjson',
      title: 'JSON ➔ NDJSON / JSON Lines',
      description: 'Convert JSON array to newline delimited JSON stream',
      category: 'Converters',
      icon: <FileCode2 className="w-4 h-4 text-emerald-500" />,
      keywords: ['jsonl', 'stream', 'logs'],
      action: () => onRunCrossConversion('json', 'ndjson'),
    },
    {
      id: 'conv-python',
      title: 'JSON ➔ Python Dict',
      description: 'Format JSON into Python dictionary literal syntax',
      category: 'Converters',
      icon: <Code className="w-4 h-4 text-amber-500" />,
      keywords: ['py', 'dictionary', 'dict'],
      action: () => onRunCrossConversion('json', 'python'),
    },
    {
      id: 'conv-php',
      title: 'JSON ➔ PHP Array',
      description: 'Format JSON into PHP associative array syntax',
      category: 'Converters',
      icon: <Code className="w-4 h-4 text-purple-500" />,
      keywords: ['php', 'array', 'assoc'],
      action: () => onRunCrossConversion('json', 'php'),
    },

    // -----------------------------------------------------------------
    // 3. Developer Studios & Tools
    // -----------------------------------------------------------------
    {
      id: 'tool-sql-studio',
      title: 'SQL Studio & Generator',
      description: 'Custom table naming, batch sizes, and multi-dialect SQL generation',
      category: 'Dev Tools',
      icon: <Database className="w-4 h-4 text-indigo-500" />,
      action: () => onOpenModal('sql'),
    },
    {
      id: 'tool-diff',
      title: 'JSON Side-by-Side Visual Diff',
      description: 'Compare two JSON objects with side-by-side delta highlighting',
      category: 'Dev Tools',
      icon: <GitCompare className="w-4 h-4 text-emerald-500" />,
      shortcut: 'Ctrl+Shift+D',
      keywords: ['compare', 'delta', 'changes'],
      action: () => onOpenModal('diff'),
    },
    {
      id: 'tool-transform',
      title: 'Case Converter / PII Masking / JSONPath',
      description: 'Transform key casing (camel, snake, kebab), mask PII fields, and run path queries',
      category: 'Dev Tools',
      icon: <Wand2 className="w-4 h-4 text-violet-500" />,
      keywords: ['casing', 'pii', 'redact', 'jsonpath', 'query'],
      action: () => onOpenModal('transform'),
    },
    {
      id: 'tool-code-gen',
      title: 'Multi-Language Model Generator',
      description: 'Generate production models in TypeScript, Python, Go, Rust, C#, Java, Swift, Dart',
      category: 'Dev Tools',
      icon: <Code2 className="w-4 h-4 text-blue-500" />,
      shortcut: 'Ctrl+Shift+G',
      keywords: ['pydantic', 'dataclass', 'struct', 'record', 'freezed'],
      action: () => onOpenModal('code'),
    },
    {
      id: 'tool-jq',
      title: 'jq Syntax Query Playground',
      description: 'Run custom UNIX jq expressions (.users[] | select(.age > 30))',
      category: 'Dev Tools',
      icon: <Terminal className="w-4 h-4 text-teal-500" />,
      shortcut: 'Ctrl+Shift+Q',
      keywords: ['jq', 'filter', 'query', 'expression'],
      action: () => onOpenModal('jq'),
    },
    {
      id: 'tool-patch',
      title: 'JSON Patch (RFC 6902 & RFC 7386)',
      description: 'Generate and apply RFC 6902 JSON Patch & RFC 7386 Merge Patch operations',
      category: 'Dev Tools',
      icon: <FileDiff className="w-4 h-4 text-cyan-500" />,
      keywords: ['rfc6902', 'rfc7386', 'merge', 'patch'],
      action: () => onOpenModal('patch'),
    },
    {
      id: 'tool-api-spec',
      title: 'OpenAPI 3.0 / cURL / GraphQL Specs',
      description: 'Generate OpenAPI 3.0 specs, parse cURL commands, and infer GraphQL schemas',
      category: 'Dev Tools',
      icon: <FileCode2 className="w-4 h-4 text-orange-500" />,
      keywords: ['swagger', 'curl', 'graphql', 'rest'],
      action: () => onOpenModal('api'),
    },
    {
      id: 'tool-jwt',
      title: 'JWT Inspector & Claims Decoder',
      description: 'Decode JWT header, payload claims, expiration timestamps, and signature',
      category: 'Dev Tools',
      icon: <KeyRound className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl+Shift+J',
      keywords: ['jwt', 'token', 'auth', 'bearer', 'decode'],
      action: () => onOpenModal('jwt'),
    },
    {
      id: 'tool-object-graph',
      title: 'Interactive ER & Object Graph Visualizer',
      description: 'Explore JSON node hierarchies, entity relationships, and schemas visually',
      category: 'Dev Tools',
      icon: <Network className="w-4 h-4 text-purple-500" />,
      keywords: ['er', 'graph', 'tree', 'visual', 'nodes'],
      action: () => onOpenModal('graph'),
    },
    {
      id: 'tool-profiler',
      title: 'Payload Profiler & Stats Inspector',
      description: 'Inspect type breakdown, maximum depth, size distribution, and top arrays',
      category: 'Dev Tools',
      icon: <BarChart3 className="w-4 h-4 text-emerald-500" />,
      keywords: ['stats', 'profile', 'depth', 'metrics'],
      action: () => onOpenModal('profiler'),
    },
    {
      id: 'tool-batch',
      title: 'Multi-File Drag & Drop Batch Processor',
      description: 'Process, convert, or format multiple files in batch',
      category: 'Dev Tools',
      icon: <FolderArchive className="w-4 h-4 text-amber-500" />,
      keywords: ['batch', 'multi', 'files', 'bulk'],
      action: () => onOpenModal('batch'),
    },
    {
      id: 'tool-url-fetcher',
      title: 'URL & API Endpoint Fetcher',
      description: 'Fetch JSON payloads directly from remote HTTP API endpoints',
      category: 'Dev Tools',
      icon: <Globe className="w-4 h-4 text-sky-500" />,
      keywords: ['fetch', 'http', 'api', 'endpoint', 'url'],
      action: () => onOpenModal('url'),
    },
    {
      id: 'tool-charts',
      title: 'Visual Analytics & Charts Studio',
      description: 'Render interactive Bar, Line, Area & Pie charts from JSON data',
      category: 'Dev Tools',
      icon: <BarChart3 className="w-4 h-4 text-indigo-500" />,
      keywords: ['chart', 'graph', 'analytics', 'recharts', 'bar', 'pie'],
      action: () => onOpenModal('charts'),
    },
    {
      id: 'tool-llm-spec',
      title: 'AI / LLM Structured Spec Generator',
      description: 'Generate OpenAI function specs, Gemini function declarations, Zod & TypeBox schemas',
      category: 'Dev Tools',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      keywords: ['openai', 'gemini', 'zod', 'typebox', 'llm', 'ai', 'tool'],
      action: () => onOpenModal('llm'),
    },

    // -----------------------------------------------------------------
    // 4. Sample Datasets
    // -----------------------------------------------------------------
    ...SAMPLE_DATASETS.map((sample) => ({
      id: `sample-${sample.id}`,
      title: `Sample: ${sample.name}`,
      description: sample.description,
      category: 'Samples' as const,
      icon: <FolderOpen className="w-4 h-4 text-amber-500" />,
      keywords: [sample.format, sample.name.toLowerCase()],
      action: () => onSelectSample(sample),
    })),

    // -----------------------------------------------------------------
    // 5. Navigation & Preferences
    // -----------------------------------------------------------------
    {
      id: 'nav-history',
      title: 'Open Conversion History',
      description: 'View saved local conversion history log',
      category: 'Navigation',
      icon: <History className="w-4 h-4 text-indigo-500" />,
      action: () => onOpenModal('history'),
    },
    {
      id: 'nav-settings',
      title: 'User Preferences & Settings',
      description: 'Configure indentation, CSV delimiters, SQL options, and auto-format preferences',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-zinc-500" />,
      action: () => onOpenModal('settings'),
    },
    {
      id: 'nav-shortcuts',
      title: 'Keyboard Shortcuts Cheat Sheet',
      description: 'View all keyboard shortcuts and hotkeys',
      category: 'Navigation',
      icon: <Command className="w-4 h-4 text-indigo-500" />,
      shortcut: 'Ctrl+/',
      action: () => onOpenModal('shortcuts'),
    },
    {
      id: 'nav-theme',
      title: 'Toggle Dark / Light Theme',
      description: 'Switch application color theme between sleek dark and light mode',
      category: 'Navigation',
      icon: <SlidersHorizontal className="w-4 h-4 text-zinc-500" />,
      action: () => onToggleTheme(),
    },
  ];

  // Filter commands by query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchTitle = cmd.title.toLowerCase().includes(q);
    const matchDesc = cmd.description.toLowerCase().includes(q);
    const matchCat = cmd.category.toLowerCase().includes(q);
    const matchKw = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchCat || matchKw;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="relative px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, feature, converter, or sample name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
              Esc
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="p-2 space-y-1 overflow-y-auto max-h-[60vh]">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No matching commands or features found for &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="truncate">{cmd.title}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {cmd.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px] border border-zinc-200 dark:border-zinc-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-indigo-500' : 'text-zinc-300 dark:text-zinc-600'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Dismiss</span>
          </span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3 text-indigo-500" /> JSON Studio Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};
