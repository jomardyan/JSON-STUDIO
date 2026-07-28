import React from 'react';
import {
  FileText,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TransformationStats, ValidationError } from '../types';
import { formatBytes } from '../utils/jsonUtils';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface StatsBarProps {
  isValid: boolean;
  error: ValidationError | null;
  stats: TransformationStats | null;
  activeAction: string;
  language?: SupportedLanguage;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  isValid,
  error,
  stats,
  activeAction,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      {/* Validation Status */}
      <div className="flex items-center gap-2 text-[11px]">
        {isValid ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t.validFormat} {stats?.inputBytes ? 'JSON' : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {error ? `${t.invalidFormat} :${error.line || 1}:${error.column || 1}` : t.invalidFormat}
          </span>
        )}

        {activeAction && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px]">
            {activeAction}
          </span>
        )}
      </div>

      {/* Numerical Stats */}
      {stats && (
        <div className="flex items-center gap-3.5 text-zinc-500 dark:text-zinc-400 text-[11px] overflow-x-auto">
          {/* Size Comparison */}
          <div className="flex items-center gap-1.5" title="Input vs Output Size">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formatBytes(stats.inputBytes)}</span>
            <ArrowRight className="w-3 h-3 text-zinc-400" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {formatBytes(stats.outputBytes)}
            </span>
            {stats.compressionRatio !== 0 && (
              <span
                className={`ml-1 text-[10px] font-bold px-1 rounded ${
                  stats.compressionRatio > 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {stats.compressionRatio > 0 ? `-${stats.compressionRatio}%` : `+${Math.abs(stats.compressionRatio)}%`}
              </span>
            )}
          </div>

          <span className="text-zinc-300 dark:text-zinc-800">|</span>

          {/* Line Counts */}
          <div>
            <span>{stats.inputLines}</span>
            <span className="text-zinc-400 mx-0.5">→</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {stats.outputLines} {t.lines.toLowerCase()}
            </span>
          </div>

          {stats.nodeCount > 0 && (
            <>
              <span className="text-zinc-300 dark:text-zinc-800">|</span>
              <div className="flex items-center gap-1" title="JSON Nodes & Max Depth">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  {stats.nodeCount} {t.nodes.toLowerCase()} ({t.depth.toLowerCase()} {stats.maxDepth})
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </footer>
  );
};

