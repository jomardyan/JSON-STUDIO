import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: 'Formatting & Transformations',
      shortcuts: [
        { key: `${modKey} + Enter`, description: 'Format & Beautify JSON' },
        { key: `${modKey} + Shift + M`, description: 'Minify JSON' },
        { key: `${modKey} + Shift + R`, description: 'Auto-Repair Syntax Errors' },
        { key: `${modKey} + Shift + S`, description: 'Sort Keys Alphabetically (A-Z)' },
      ],
    },
    {
      title: 'Editor & Quick Tools',
      shortcuts: [
        { key: `${modKey} + Shift + C`, description: 'Copy Output to Clipboard' },
        { key: `${modKey} + Shift + X`, description: 'Swap Output into Input' },
        { key: `${modKey} + K`, description: 'Clear Input Editor' },
        { key: `${modKey} + /`, description: 'Open Keyboard Shortcuts Cheat Sheet' },
      ],
    },
    {
      title: 'Developer Studios',
      shortcuts: [
        { key: `${modKey} + Shift + D`, description: 'Open Side-by-Side Diff' },
        { key: `${modKey} + Shift + Q`, description: 'Open jq Query Playground' },
        { key: `${modKey} + Shift + G`, description: 'Open Multi-Lang Code Generator' },
        { key: `${modKey} + Shift + J`, description: 'Open JWT Inspector' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Keyboard Shortcuts Cheat Sheet
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Boost your productivity with quick hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.shortcuts.map((sc, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {sc.description}
                    </span>
                    <kbd className="px-2 py-1 rounded-md bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-zinc-400" /> Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px]">Esc</kbd> to dismiss anytime
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
