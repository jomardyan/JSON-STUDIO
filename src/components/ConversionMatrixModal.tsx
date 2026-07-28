import React from 'react';
import { AlertTriangle, CheckCircle2, CircleDot, Table, X, XCircle } from 'lucide-react';
import {
  ConversionCompatibility,
  getConversionCompatibility,
  listFormatAdapters,
} from '../adapters/formatRegistry';

interface ConversionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversion: (from: string, to: string) => void;
}

const FORMATS = listFormatAdapters().map((adapter) => ({
  id: adapter.id,
  name: adapter.name,
}));

function CompatibilityCell({
  compatibility,
  fromName,
  toName,
  onClick,
}: {
  compatibility: ConversionCompatibility;
  fromName: string;
  toName: string;
  onClick: () => void;
}) {
  if (compatibility.status === 'same') {
    return <span className="text-[10px] text-zinc-400 font-mono">-</span>;
  }

  if (compatibility.status === 'none') {
    return (
      <span
        className="inline-flex items-center justify-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono"
        title={compatibility.reasons.join('. ')}
      >
        <XCircle className="w-3 h-3" />
        N/A
      </span>
    );
  }

  const styles = {
    supported:
      'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    partial:
      'bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20',
    lossy:
      'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20',
  }[compatibility.status];

  const icon = {
    supported: <CheckCircle2 className="w-3 h-3" />,
    partial: <CircleDot className="w-3 h-3" />,
    lossy: <AlertTriangle className="w-3 h-3" />,
  }[compatibility.status];

  const text = {
    supported: 'Supported',
    partial: 'Partial',
    lossy: 'Lossy',
  }[compatibility.status];

  const details = compatibility.reasons.length
    ? compatibility.reasons.join('. ')
    : compatibility.label;

  return (
    <button
      onClick={onClick}
      className={`w-full py-1.5 px-1 rounded border transition-colors cursor-pointer text-[10px] font-mono font-semibold flex items-center justify-center gap-1 ${styles}`}
      title={`Convert ${fromName} to ${toName}. ${details}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

export const ConversionMatrixModal: React.FC<ConversionMatrixModalProps> = ({
  isOpen,
  onClose,
  onSelectConversion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversion-matrix-title"
      >
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="conversion-matrix-title"
                className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
              >
                <span>Conversion Compatibility Matrix</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {FORMATS.length} x {FORMATS.length} formats
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Availability and risk are generated directly from registered adapter capabilities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close conversion matrix"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 p-2 border-b border-r border-zinc-200 dark:border-zinc-800 font-mono font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-800">
                  From / To
                </th>
                {FORMATS.map((format) => (
                  <th
                    key={format.id}
                    className="sticky top-0 z-10 p-2 border-b border-zinc-200 dark:border-zinc-800 font-mono font-semibold text-zinc-700 dark:text-zinc-300 text-center min-w-[92px] bg-zinc-50 dark:bg-zinc-800"
                    title={format.name}
                  >
                    {format.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FORMATS.map((source) => (
                <tr key={source.id} className="border-b border-zinc-100 dark:border-zinc-800/60">
                  <th className="sticky left-0 z-10 p-2 border-r border-zinc-200 dark:border-zinc-800 font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800">
                    {source.name}
                  </th>
                  {FORMATS.map((target) => {
                    const compatibility = getConversionCompatibility(source.id, target.id);
                    return (
                      <td key={target.id} className="p-1 text-center">
                        <CompatibilityCell
                          compatibility={compatibility}
                          fromName={source.name}
                          toName={target.name}
                          onClick={() => {
                            onSelectConversion(source.id, target.id);
                            onClose();
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Supported
            </span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
              <CircleDot className="w-3.5 h-3.5" /> Partial format subset
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Potential data loss
            </span>
            <span className="flex items-center gap-1 text-zinc-400">
              <XCircle className="w-3.5 h-3.5" /> Unavailable direction
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
