import React from 'react';
import { X, Search, Check, Copy, Sparkles, Terminal, BookOpen } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { evaluateJq } from '../utils/jqEngine';

interface JqQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyResult: (resultText: string, queryStr: string) => void;
  language?: SupportedLanguage;
}

const PRESET_QUERIES = [
  { label: 'All Items (.items[])', query: '.items[]' },
  { label: 'Select Filter (select(.age > 21))', query: '.users[] | select(.age > 21)' },
  { label: 'Map Key Names (map(.name))', query: 'map(.name)' },
  { label: 'Object Keys (keys)', query: 'keys' },
  { label: 'Length / Count (length)', query: 'length' },
  { label: 'Sort by Field (sort_by(.age))', query: 'sort_by(.age)' },
  { label: 'Convert to Entries (to_entries)', query: 'to_entries' },
];

export const JqQueryModal: React.FC<JqQueryModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyResult,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');
  const [jqQuery, setJqQuery] = React.useState<string>('.');
  const [outputResult, setOutputResult] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) return;

    const res = evaluateJq(inputText, jqQuery);
    if (res.error) {
      setErrorMessage(res.error);
      setOutputResult('');
    } else {
      setErrorMessage(null);
      setOutputResult(res.resultString);
    }
  }, [isOpen, inputText, jqQuery]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (outputResult && !errorMessage) {
      onApplyResult(outputResult, jqQuery);
      onClose();
    }
  };

  const handleCopy = () => {
    if (outputResult) {
      navigator.clipboard.writeText(outputResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>jq Syntax Query Playground</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  CLI Filter Engine
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Execute UNIX jq queries, filter pipes, array mappings, and conditional filters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Bar Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 select-none">
              jq &gt;
            </span>
            <input
              type="text"
              value={jqQuery}
              onChange={(e) => setJqQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              placeholder=".users[] | select(.age > 21) | .name"
            />
          </div>

          {/* Presets Row */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Quick Snippets:
            </span>
            {PRESET_QUERIES.map((p) => (
              <button
                key={p.label}
                onClick={() => setJqQuery(p.query)}
                className="px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/60 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 transition-colors font-mono text-[11px] cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                {p.query}
              </button>
            ))}
          </div>
        </div>

        {/* Output Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 text-xs">
          {/* Source Input */}
          <div className="flex flex-col space-y-1.5">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Input Document Source
            </span>
            <textarea
              readOnly
              value={inputText}
              className="w-full h-72 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed opacity-80"
            />
          </div>

          {/* Evaluated Result */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>jq Filtered Output</span>
              </span>
              {outputResult && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Output'}</span>
                </button>
              )}
            </div>

            {errorMessage ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono h-72 overflow-auto">
                {errorMessage}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-72 border border-zinc-800 leading-relaxed select-all">
                {outputResult || '// Filter result will appear here'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Click Apply to replace main editor contents with filtered query result
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!outputResult || Boolean(errorMessage)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filter to Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
