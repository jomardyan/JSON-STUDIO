import React from 'react';
import {
  X,
  BarChart2,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Sliders,
  Download,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { analyzeJsonForCharts } from '../utils/chartUtils';

interface JsonChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any;
}

type ChartType = 'bar' | 'line' | 'area' | 'pie';

const COLOR_PALETTES = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#3b82f6', // Blue
];

export const JsonChartsModal: React.FC<JsonChartsModalProps> = ({
  isOpen,
  onClose,
  jsonData,
}) => {
  const [chartType, setChartType] = React.useState<ChartType>('bar');
  const [selectedXKey, setSelectedXKey] = React.useState<string>('');
  const [selectedYKeys, setSelectedYKeys] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);

  const chartDataInfo = React.useMemo(() => {
    return analyzeJsonForCharts(jsonData);
  }, [jsonData]);

  React.useEffect(() => {
    if (chartDataInfo.records.length > 0) {
      setSelectedXKey(chartDataInfo.defaultXKey || 'index');
      setSelectedYKeys(chartDataInfo.defaultYKeys);
    }
  }, [chartDataInfo]);

  if (!isOpen) return null;

  const toggleYKey = (key: string) => {
    if (selectedYKeys.includes(key)) {
      if (selectedYKeys.length > 1) {
        setSelectedYKeys(selectedYKeys.filter((k) => k !== key));
      }
    } else {
      setSelectedYKeys([...selectedYKeys, key]);
    }
  };

  const handleCopySummary = () => {
    const summary = {
      recordsCount: chartDataInfo.records.length,
      dimension: selectedXKey,
      metrics: selectedYKeys,
      sampleData: chartDataInfo.records.slice(0, 5),
    };
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Visual Analytics & Chart Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {chartDataInfo.records.length} Records
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Transform JSON metrics into interactive data visualizations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="space-y-5 lg:col-span-1 border-r border-zinc-200 dark:border-zinc-800 pr-4">
            {/* Chart Type Selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Chart Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Bar
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    chartType === 'line'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Line
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Area
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    chartType === 'pie'
                      ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <PieIcon className="w-4 h-4" />
                  Pie
                </button>
              </div>
            </div>

            {/* X Axis Dimension Key */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                X-Axis (Dimension)
              </label>
              <select
                value={selectedXKey}
                onChange={(e) => setSelectedXKey(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="index">Record Index (#)</option>
                {chartDataInfo.categoryKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Y Axis Numeric Metric Keys */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Y-Axis (Metrics)
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {chartDataInfo.numericKeys.length > 0 ? (
                  chartDataInfo.numericKeys.map((k, idx) => {
                    const isChecked = selectedYKeys.includes(k);
                    return (
                      <button
                        key={k}
                        onClick={() => toggleYKey(k)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                            : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <span className="truncate">{k}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isChecked
                              ? COLOR_PALETTES[idx % COLOR_PALETTES.length]
                              : '#cbd5e1',
                          }}
                        />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-amber-500">No numeric fields found in dataset</p>
                )}
              </div>
            </div>

            {/* Copy Metrics Summary */}
            <div className="pt-2">
              <button
                onClick={handleCopySummary}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Summary!' : 'Copy Chart Summary'}</span>
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="lg:col-span-3 min-h-[380px] flex flex-col justify-between bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800/80">
            {chartDataInfo.records.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                <BarChart2 className="w-8 h-8 opacity-40" />
                <p>No valid numeric records to render chart visualization</p>
              </div>
            ) : (
              <div className="w-full h-[360px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartDataInfo.records}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey={selectedXKey} stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {selectedYKeys.map((yKey, idx) => (
                        <Bar
                          key={yKey}
                          dataKey={yKey}
                          fill={COLOR_PALETTES[idx % COLOR_PALETTES.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={chartDataInfo.records}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey={selectedXKey} stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {selectedYKeys.map((yKey, idx) => (
                        <Line
                          key={yKey}
                          type="monotone"
                          dataKey={yKey}
                          stroke={COLOR_PALETTES[idx % COLOR_PALETTES.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={chartDataInfo.records}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey={selectedXKey} stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      {selectedYKeys.map((yKey, idx) => (
                        <Area
                          key={yKey}
                          type="monotone"
                          dataKey={yKey}
                          fill={COLOR_PALETTES[idx % COLOR_PALETTES.length]}
                          stroke={COLOR_PALETTES[idx % COLOR_PALETTES.length]}
                          fillOpacity={0.2}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          borderColor: '#27272a',
                          borderRadius: '8px',
                          color: '#f4f4f5',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Pie
                        data={chartDataInfo.records}
                        dataKey={selectedYKeys[0] || chartDataInfo.numericKeys[0]}
                        nameKey={selectedXKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {chartDataInfo.records.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={COLOR_PALETTES[idx % COLOR_PALETTES.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
