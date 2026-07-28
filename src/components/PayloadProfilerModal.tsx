import React from 'react';
import { X, BarChart3, Database, Key, HardDrive, Layers, Percent, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { profileJsonPayload, JsonProfileReport } from '../utils/jsonProfiler';

interface PayloadProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  language?: SupportedLanguage;
}

export const PayloadProfilerModal: React.FC<PayloadProfilerModalProps> = ({
  isOpen,
  onClose,
  inputText,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [report, setReport] = React.useState<JsonProfileReport | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const res = profileJsonPayload(inputText);
    setReport(res);
  }, [isOpen, inputText]);

  if (!isOpen) return null;

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>JSON Payload Profiler & Structural Stats Inspector</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Performance Metrics
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Byte distribution by data type, array lengths, key frequencies, and nesting depth breakdown
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {report?.error ? (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono">
              {report.error}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-semibold">Raw Size</span>
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatBytes(report?.totalBytes || 0)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Minified: {formatBytes(report?.minifiedBytes || 0)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-semibold">Total Keys</span>
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {report?.totalKeys}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Unique Keys: {report?.uniqueKeysCount}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-semibold">Max Depth</span>
                    <Layers className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {report?.maxDepth} levels
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Root Type: <span className="uppercase font-bold">{report?.rootType}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[11px] font-semibold">Primitives & Nodes</span>
                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                  </div>
                  <div className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {report?.totalPrimitiveValues}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Objects: {report?.totalObjects} | Arrays: {report?.totalArrays}
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Breakdown Pie Chart */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Byte Distribution by Data Type</span>
                    <Percent className="w-3.5 h-3.5 text-emerald-500" />
                  </h3>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report?.typeBreakdown || []}
                          dataKey="estimatedBytes"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {(report?.typeBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => formatBytes(Number(value))}
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Frequent Keys Bar Chart */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center justify-between">
                    <span>Most Frequent Key Names</span>
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                  </h3>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report?.frequentKeys || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="key" interval={0} angle={-30} textAnchor="end" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top Array Lengths List */}
              {report?.topArrays && report.topArrays.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-2">
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    Largest Array Structures
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono">
                    {report.topArrays.map((arr, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate" title={arr.path}>
                            {arr.path}
                          </span>
                          <span className="text-[10px] text-zinc-400">Type: {arr.elementType}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold text-xs">
                          {arr.length} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Byte savings minified: {report ? Math.round((1 - report.minifiedBytes / (report.formattedBytes || 1)) * 100) : 0}% reduction
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
