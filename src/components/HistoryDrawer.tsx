import React from 'react';
import {
  X,
  History,
  Trash2,
  Copy,
  Check,
  Search,
  Clock,
} from 'lucide-react';
import { HistoryItem } from '../types';
import { formatBytes } from '../utils/jsonUtils';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language?: SupportedLanguage;
  historyItems: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  language = 'en',
  historyItems,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearHistory,
}) => {
  const [filterText, setFilterText] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const t = getTranslation((language as SupportedLanguage) || 'en');

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) => {
    if (!filterText.trim()) return true;
    const query = filterText.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.outputFormat.toLowerCase().includes(query) ||
      item.inputText.toLowerCase().includes(query)
    );
  });

  const handleCopyOutput = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 font-sans">
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t.historyTitle}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {historyItems.length} {t.historySubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Clear bar */}
        <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={t.searchHistory}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          {historyItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm(t.clearAllHistory + '?')) {
                  onClearHistory();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer font-medium shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clearAllHistory}
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs space-y-2">
              <Clock className="w-6 h-6 mx-auto opacity-40" />
              <p>{t.noHistoryItems}</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="group p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 line-clamp-1">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      <span className="uppercase bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded text-[10px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {item.outputFormat}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{formatBytes(item.outputSizeBytes)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopyOutput(item.id, item.outputText, e)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title={t.copy}
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                      title={t.clear}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preview text snippet */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-2 rounded font-mono text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-2 overflow-hidden">
                  {item.outputText.slice(0, 120)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
