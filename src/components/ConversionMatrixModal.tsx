import React from 'react';
import { X, Table, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { getFormatAdapter } from '../adapters/formatRegistry';

interface ConversionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversion: (from: string, to: string) => void;
}

const FORMATS = [
  { id: 'json', name: 'JSON' },
  { id: 'csv', name: 'CSV' },
  { id: 'xml', name: 'XML' },
  { id: 'yaml', name: 'YAML' },
  { id: 'toml', name: 'TOML' },
  { id: 'sql', name: 'SQL' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'html', name: 'HTML' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'php', name: 'PHP' },
  { id: 'ndjson', name: 'NDJSON' },
  { id: 'properties', name: 'Properties' },
];

export const ConversionMatrixModal: React.FC<ConversionMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectConversion,
}) => {
  if (!isOpen) return null;

  const getCompatibility = (from: string, to: string) => {
    if (from === to) return { status: 'same', label: 'Identical' };

    const fromAdapter = getFormatAdapter(from);
    const toAdapter = getFormatAdapter(to);

    if (!fromAdapter || !toAdapter) return { status: 'none', label: 'N/A' };

    // Serialization check
    if (from === 'markdown' || from === 'html' || from === 'typescript' || from === 'python' || from === 'php') {
      return { status: 'none', label: 'One-Way' };
    }

    if (!toAdapter.capabilities.supportsNestedObjects && fromAdapter.capabilities.supportsNestedObjects) {
      return { status: 'lossy', label: 'Lossy (Flattens objects)' };
    }

    return { status: 'full', label: 'Lossless' };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Conversion Compatibility Matrix</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  14x14 Formats
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Click any matrix cell to execute instant format conversion with loss assessment
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

        {/* Matrix Grid */}
        <div className="p-5 overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 border-b border-r border-zinc-200 dark:border-zinc-800 font-mono font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800/40">
                  From \ To
                </th>
                {FORMATS.map((fmt) => (
                  <th
                    key={fmt.id}
                    className="p-2 border-b border-zinc-200 dark:border-zinc-800 font-mono font-semibold text-zinc-700 dark:text-zinc-300 text-center min-w-[70px] bg-zinc-50 dark:bg-zinc-800/40"
                  >
                    {fmt.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((fromFmt) => (
                <tr key={fromFmt.id} className="border-b border-zinc-100 dark:border-zinc-800/60">
                  <td className="p-2 border-r border-zinc-200 dark:border-zinc-800 font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50/50 dark:bg-zinc-800/20">
                    {fromFmt.name}
                  </td>
                  {FORMATS.map((toFmt) => {
                    const comp = getCompatibility(fromFmt.id, toFmt.id);
                    return (
                      <td key={toFmt.id} className="p-1 text-center">
                        {comp.status === 'same' ? (
                          <span className="text-[10px] text-zinc-400 font-mono">—</span>
                        ) : comp.status === 'full' ? (
                          <button
                            onClick={() => {
                              onSelectConversion(fromFmt.id, toFmt.id);
                              onClose();
                            }}
                            className="w-full py-1.5 px-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer text-[10px] font-mono font-semibold flex items-center justify-center gap-1"
                            title={`Convert ${fromFmt.name} to ${toFmt.name} (Lossless)`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100%</span>
                          </button>
                        ) : comp.status === 'lossy' ? (
                          <button
                            onClick={() => {
                              onSelectConversion(fromFmt.id, toFmt.id);
                              onClose();
                            }}
                            className="w-full py-1.5 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer text-[10px] font-mono font-semibold flex items-center justify-center gap-1"
                            title={`Convert ${fromFmt.name} to ${toFmt.name} (${comp.label})`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Lossy</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
                            N/A
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Lossless Conversion
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Lossy (Flattened / Coerced)
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <XCircle className="w-3.5 h-3.5" /> N/A (One-Way Serializer)
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
