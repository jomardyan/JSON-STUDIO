import React from 'react';
import { X, GitCompare, Check, Plus, Minus, Edit3, ArrowRight, Copy } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { diffJsonObjects, JsonDiffResult } from '../utils/jsonUtils';

interface JsonDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLeftText: string;
  language?: SupportedLanguage;
}

export const JsonDiffModal: React.FC<JsonDiffModalProps> = ({
  isOpen,
  onClose,
  initialLeftText,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');
  const [leftJson, setLeftJson] = React.useState<string>(initialLeftText || '{\n  "name": "JSON Studio",\n  "version": 1,\n  "active": true\n}');
  const [rightJson, setRightJson] = React.useState<string>('{\n  "name": "JSON Studio Pro",\n  "version": 2,\n  "active": true,\n  "newFeature": "Diff Tool"\n}');
  const [diffResult, setDiffResult] = React.useState<JsonDiffResult | null>(null);

  React.useEffect(() => {
    if (initialLeftText && isOpen) {
      setLeftJson(initialLeftText);
    }
  }, [initialLeftText, isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const res = diffJsonObjects(leftJson, rightJson);
    setDiffResult(res);
  }, [isOpen, leftJson, rightJson]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>JSON Visual Comparator & Diff</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Side-by-Side
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Compare original vs modified JSON objects with key-level delta detection
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

        {/* Diff Stats Banner */}
        {diffResult && (
          <div className="px-5 py-2.5 bg-zinc-100/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs font-mono">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              {diffResult.same ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" /> Perfect Match
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">{diffResult.summary}</span>
              )}
            </span>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Plus className="w-3.5 h-3.5" /> {diffResult.addedKeys.length} Added
              </span>
              <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <Minus className="w-3.5 h-3.5" /> {diffResult.removedKeys.length} Removed
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Edit3 className="w-3.5 h-3.5" /> {diffResult.modifiedKeys.length} Modified
              </span>
            </div>
          </div>
        )}

        {/* Editors & Delta Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Left JSON */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Original JSON (Left)</span>
              <span className="text-[10px] text-zinc-400 font-mono">{leftJson.length} chars</span>
            </div>
            <textarea
              value={leftJson}
              onChange={(e) => setLeftJson(e.target.value)}
              className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
              placeholder="Paste base JSON..."
            />
          </div>

          {/* Right JSON */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Target JSON (Right)</span>
              <span className="text-[10px] text-zinc-400 font-mono">{rightJson.length} chars</span>
            </div>
            <textarea
              value={rightJson}
              onChange={(e) => setRightJson(e.target.value)}
              className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
              placeholder="Paste updated JSON..."
            />
          </div>

          {/* Key-level Changes Summary Panel */}
          {diffResult && !diffResult.same && (
            <div className="md:col-span-2 mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">Detailed Field Changes</h4>
              <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                {diffResult.addedKeys.map((key) => (
                  <div key={key} className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Plus className="w-3 h-3" />
                    <span>Added key: <strong>{key}</strong></span>
                  </div>
                ))}

                {diffResult.removedKeys.map((key) => (
                  <div key={key} className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <Minus className="w-3 h-3" />
                    <span>Removed key: <strong>{key}</strong></span>
                  </div>
                ))}

                {diffResult.modifiedKeys.map((mod) => (
                  <div key={mod.path} className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Edit3 className="w-3 h-3" />
                    <span>
                      Modified <strong>{mod.path}</strong>: {JSON.stringify(mod.valA)} <ArrowRight className="w-3 h-3 inline" /> {JSON.stringify(mod.valB)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Click outside or ESC to close
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};
