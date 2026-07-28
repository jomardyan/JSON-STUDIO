import React from 'react';
import { X, Sliders, Check, Globe } from 'lucide-react';
import { UserPreferences, IndentOption } from '../types';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (newPrefs: UserPreferences) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [prefs, setPrefs] = React.useState<UserPreferences>(preferences);

  React.useEffect(() => {
    setPrefs(preferences);
  }, [preferences]);

  if (!isOpen) return null;

  const currentLang: SupportedLanguage = prefs.language || 'en';
  const t = getTranslation(currentLang);

  const handleSave = () => {
    onSavePreferences(prefs);
    onClose();
  };

  const languageOptions: { key: SupportedLanguage; label: string; flag: string }[] = [
    { key: 'en', label: 'English', flag: '🇬🇧' },
    { key: 'pl', label: 'Polski', flag: '🇵🇱' },
    { key: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { key: 'es', label: 'Español', flag: '🇪🇸' },
    { key: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-10 p-5 space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t.settingsTitle}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.settingsSubtitle}
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

        {/* Options Form */}
        <div className="space-y-4 text-xs">
          {/* Language Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              {t.languageSelect}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {languageOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, language: opt.key })}
                  className={`px-2 py-1.5 text-xs rounded border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentLang === opt.key
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* JSON Indent */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t.jsonIndent}
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {[
                { label: t.spaces2, value: '2' },
                { label: t.spaces4, value: '4' },
                { label: t.tabIndent, value: 'tab' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, indent: opt.value as IndentOption })}
                  className={`px-2 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                    prefs.indent === opt.value
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSV Delimiter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t.csvDelimiter}
            </label>
            <div className="grid grid-cols-4 gap-1.5 font-mono">
              {[
                { label: 'Comma (,)', value: ',' },
                { label: 'Semicolon (;)', value: ';' },
                { label: 'Tab (\\t)', value: '\t' },
                { label: 'Pipe (|)', value: '|' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      csvOptions: { ...prefs.csvOptions, delimiter: opt.value as any },
                    })
                  }
                  className={`px-1 py-1.5 text-[11px] rounded border transition-colors cursor-pointer text-center ${
                    prefs.csvOptions.delimiter === opt.value
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* XML Root Tag Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t.xmlRootElement}
            </label>
            <input
              type="text"
              value={prefs.xmlOptions.rootName}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  xmlOptions: { ...prefs.xmlOptions, rootName: e.target.value || 'root' },
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              placeholder="root"
            />
          </div>

          {/* SQL Table Name & Dialect */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {t.sqlTableName}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                value={prefs.sqlOptions?.tableName || 'records'}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    sqlOptions: { ...prefs.sqlOptions, tableName: e.target.value || 'records' },
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="records"
              />
              <select
                value={prefs.sqlOptions?.dialect || 'mysql'}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    sqlOptions: { ...prefs.sqlOptions, dialect: e.target.value as any },
                  })
                }
                className="w-full px-2 py-1.5 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-sans text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="mysql">MySQL</option>
                <option value="postgres">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mssql">MS SQL</option>
              </select>
            </div>
          </div>

          {/* CSV Include Headers */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                {t.csvHeaderRow}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.csvHeaderDesc}
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.csvOptions.header}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  csvOptions: { ...prefs.csvOptions, header: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>

          {/* Auto-Sort Keys on Format */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                {t.autoSortKeys}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.autoSortKeysDesc}
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.autoSortKeysOnFormat || false}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  autoSortKeysOnFormat: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>

          {/* Auto-Repair on Paste */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                {t.autoRepairOnPaste}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.autoRepairDesc}
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.autoRepairOnPaste || false}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  autoRepairOnPaste: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>

          {/* Auto-Format on Paste */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                {t.autoFormatOnPaste}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {t.autoFormatDesc}
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.autoFormatOnPaste || false}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  autoFormatOnPaste: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-zinc-900 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
          </div>

          {/* Private Session Mode Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block flex items-center gap-1">
                🔒 Private Session Mode
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Disable payload storage in browser LocalStorage & mask API keys
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.privateSessionMode || false}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  privateSessionMode: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Offline Mode & PWA Cache Status */}
          <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 space-y-1.5 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Offline Mode & PWA Caching
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                100% Client-Side
              </span>
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
              JSON Studio Pro runs completely inside your browser. All code formatting, XML/CSV/YAML conversions, SQL generation, and developer tools work without an active internet connection.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-semibold rounded hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            {t.savePreferences}
          </button>
        </div>
      </div>
    </div>
  );
};
