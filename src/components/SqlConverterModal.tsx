import React from 'react';
import { X, Database, Check, Copy, Code2, Sparkles, Layers, FileCode } from 'lucide-react';
import { SqlOptions } from '../types';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { jsonToSql, sqlToJson } from '../utils/jsonUtils';

interface SqlConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyResult: (resultText: string, format: 'json' | 'sql') => void;
  sqlOptions: SqlOptions;
  onUpdateSqlOptions: (options: SqlOptions) => void;
  language?: SupportedLanguage;
}

export const SqlConverterModal: React.FC<SqlConverterModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyResult,
  sqlOptions,
  onUpdateSqlOptions,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');
  const [options, setOptions] = React.useState<SqlOptions>(sqlOptions);
  const [direction, setDirection] = React.useState<'jsonToSql' | 'sqlToJson'>('jsonToSql');
  const [previewResult, setPreviewResult] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    setOptions(sqlOptions);
  }, [sqlOptions]);

  // Recalculate preview on option/input change
  React.useEffect(() => {
    if (!isOpen) return;

    if (direction === 'jsonToSql') {
      const { result, error } = jsonToSql(inputText, options);
      if (error) {
        setErrorMessage(error);
        setPreviewResult('');
      } else {
        setErrorMessage(null);
        setPreviewResult(result);
      }
    } else {
      const { result, error } = sqlToJson(inputText);
      if (error) {
        setErrorMessage(error);
        setPreviewResult('');
      } else {
        setErrorMessage(null);
        setPreviewResult(result);
      }
    }
  }, [isOpen, inputText, options, direction]);

  if (!isOpen) return null;

  const handleApply = () => {
    onUpdateSqlOptions(options);
    if (previewResult) {
      onApplyResult(previewResult, direction === 'jsonToSql' ? 'sql' : 'json');
    }
    onClose();
  };

  const handleCopy = () => {
    if (previewResult) {
      navigator.clipboard.writeText(previewResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const dialects: { key: SqlOptions['dialect']; name: string; quoteChar: string }[] = [
    { key: 'mysql', name: 'MySQL / MariaDB', quoteChar: '`col` ' },
    { key: 'postgres', name: 'PostgreSQL', quoteChar: '"col"' },
    { key: 'sqlite', name: 'SQLite', quoteChar: '"col"' },
    { key: 'mssql', name: 'MS SQL Server', quoteChar: '[col]' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{t.sqlConverterTool}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Universal SQL Engine
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bidirectional JSON & SQL schema, DDL & INSERT statement converter
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

        {/* Main Content Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
          {/* Settings Column */}
          <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pb-4 md:pb-0 md:pr-4 text-xs">
            {/* Mode Toggle */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Conversion Mode</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setDirection('jsonToSql')}
                  className={`py-1.5 px-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    direction === 'jsonToSql'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  JSON → SQL
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('sqlToJson')}
                  className={`py-1.5 px-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                    direction === 'sqlToJson'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  SQL → JSON
                </button>
              </div>
            </div>

            {direction === 'jsonToSql' && (
              <>
                {/* Table Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.sqlTableName}
                  </label>
                  <input
                    type="text"
                    value={options.tableName}
                    onChange={(e) => setOptions({ ...options, tableName: e.target.value || 'records' })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="records"
                  />
                </div>

                {/* Dialect */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.sqlDialect}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {dialects.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setOptions({ ...options, dialect: d.key })}
                        className={`px-2 py-1.5 rounded-lg border text-left transition-colors cursor-pointer flex flex-col ${
                          options.dialect === d.key
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <span className="text-xs">{d.name}</span>
                        <span className="text-[10px] opacity-70 font-mono">{d.quoteChar}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Batch Size */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.batchInsertSize}
                  </label>
                  <select
                    value={options.insertBatchSize}
                    onChange={(e) => setOptions({ ...options, insertBatchSize: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={1}>1 (Individual INSERTs per row)</option>
                    <option value={50}>50 rows per batch</option>
                    <option value={100}>100 rows per batch</option>
                    <option value={500}>500 rows per batch</option>
                    <option value={1000}>1000 rows per batch</option>
                  </select>
                </div>

                {/* Primary Key Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.primaryKeyField}
                  </label>
                  <input
                    type="text"
                    value={options.primaryKey || 'id'}
                    onChange={(e) => setOptions({ ...options, primaryKey: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="id"
                  />
                </div>

                {/* Switches */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {t.includeCreateTable}
                    </span>
                    <input
                      type="checkbox"
                      checked={options.includeCreateTable}
                      onChange={(e) => setOptions({ ...options, includeCreateTable: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {t.quoteIdentifiers}
                    </span>
                    <input
                      type="checkbox"
                      checked={options.quoteIdentifiers}
                      onChange={(e) => setOptions({ ...options, quoteIdentifiers: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Code Preview Column */}
          <div className="md:col-span-7 flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Result Preview</span>
              </span>

              {previewResult && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              )}
            </div>

            {errorMessage ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono flex-1 overflow-auto">
                {errorMessage}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto flex-1 max-h-[360px] border border-zinc-800 leading-relaxed select-all">
                {previewResult || '-- No output generated'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            100% Client-side browser execution
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer font-medium"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleApply}
              disabled={!previewResult}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Main Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
