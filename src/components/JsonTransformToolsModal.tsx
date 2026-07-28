import React from 'react';
import { X, KeyRound, ShieldAlert, Search, Check, Copy, Wand2, Sparkles } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { convertKeyCase, maskSensitiveData, queryJsonPath } from '../utils/jsonUtils';

interface JsonTransformToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyResult: (resultText: string, actionName: string) => void;
  language?: SupportedLanguage;
}

export const JsonTransformToolsModal: React.FC<JsonTransformToolsModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyResult,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');
  const [activeTab, setActiveTab] = React.useState<'case' | 'mask' | 'jsonpath'>('case');

  // Key Case state
  const [selectedCase, setSelectedCase] = React.useState<'camel' | 'snake' | 'kebab' | 'pascal' | 'constant'>('camel');

  // Mask state
  const [customMaskKeys, setCustomMaskKeys] = React.useState<string>('password, token, secret, ssn, email, creditCard');
  const [maskPlaceholder, setMaskPlaceholder] = React.useState<string>('***REDACTED***');

  // JSONPath state
  const [jsonPathQuery, setJsonPathQuery] = React.useState<string>('$.items[*]');

  // Results
  const [previewOutput, setPreviewOutput] = React.useState<string>('');
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'case') {
      const { result, error } = convertKeyCase(inputText, selectedCase);
      if (error) {
        setErrorMessage(error);
        setPreviewOutput('');
        setStatusMessage(null);
      } else {
        setErrorMessage(null);
        setPreviewOutput(result);
        setStatusMessage(`Transformed keys to ${selectedCase.toUpperCase()}`);
      }
    } else if (activeTab === 'mask') {
      const customKeys = customMaskKeys.split(',').map((k) => k.trim()).filter(Boolean);
      const { result, maskedCount, error } = maskSensitiveData(inputText, customKeys, maskPlaceholder);
      if (error) {
        setErrorMessage(error);
        setPreviewOutput('');
        setStatusMessage(null);
      } else {
        setErrorMessage(null);
        setPreviewOutput(result);
        setStatusMessage(`Redacted ${maskedCount} sensitive field(s)`);
      }
    } else if (activeTab === 'jsonpath') {
      const { result, matchesCount, error } = queryJsonPath(inputText, jsonPathQuery);
      if (error) {
        setErrorMessage(error);
        setPreviewOutput('');
        setStatusMessage(null);
      } else {
        setErrorMessage(null);
        setPreviewOutput(result);
        setStatusMessage(`Matched ${matchesCount} node(s)`);
      }
    }
  }, [isOpen, inputText, activeTab, selectedCase, customMaskKeys, maskPlaceholder, jsonPathQuery]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (previewOutput) {
      const actionName =
        activeTab === 'case'
          ? `Keys → ${selectedCase}`
          : activeTab === 'mask'
          ? 'Masked PII Data'
          : `JSONPath (${jsonPathQuery})`;
      onApplyResult(previewOutput, actionName);
      onClose();
    }
  };

  const handleCopy = () => {
    if (previewOutput) {
      navigator.clipboard.writeText(previewOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Advanced JSON Toolkit</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Case, Mask & Query
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bulk transform key styles, redact sensitive PII, and query via JSONPath
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-zinc-50/30 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('case')}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'case'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Key Case Converter</span>
          </button>

          <button
            onClick={() => setActiveTab('mask')}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'mask'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PII Redactor & Masking</span>
          </button>

          <button
            onClick={() => setActiveTab('jsonpath')}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'jsonpath'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>JSONPath Evaluator</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 text-xs">
          {/* Controls Column */}
          <div className="md:col-span-5 space-y-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pb-4 md:pb-0 md:pr-4">
            {activeTab === 'case' && (
              <div className="space-y-3">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Select Target Key Casing
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'camel', label: 'camelCase', example: 'userName' },
                    { id: 'snake', label: 'snake_case', example: 'user_name' },
                    { id: 'kebab', label: 'kebab-case', example: 'user-name' },
                    { id: 'pascal', label: 'PascalCase', example: 'UserName' },
                    { id: 'constant', label: 'CONSTANT_CASE', example: 'USER_NAME' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCase(item.id as any)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                        selectedCase === item.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-[10px] opacity-80">{item.example}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mask' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Sensitive Keys (comma separated)
                  </label>
                  <textarea
                    value={customMaskKeys}
                    onChange={(e) => setCustomMaskKeys(e.target.value)}
                    className="w-full h-24 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="password, token, ssn, email"
                  />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Standard keys (password, token, ssn, creditcard, api_key, etc.) are auto-detected.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Redaction Placeholder Value
                  </label>
                  <input
                    type="text"
                    value={maskPlaceholder}
                    onChange={(e) => setMaskPlaceholder(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="***REDACTED***"
                  />
                </div>
              </div>
            )}

            {activeTab === 'jsonpath' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-800 dark:text-zinc-200">
                    JSONPath Query Expression
                  </label>
                  <input
                    type="text"
                    value={jsonPathQuery}
                    onChange={(e) => setJsonPathQuery(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="$.store.book[*]"
                  />
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1">
                    <p>Examples:</p>
                    <p className="font-mono bg-zinc-100 dark:bg-zinc-800 p-1 rounded">$.data.users[*].name</p>
                    <p className="font-mono bg-zinc-100 dark:bg-zinc-800 p-1 rounded">items[0].id</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Result Output Column */}
          <div className="md:col-span-7 flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Result Preview</span>
              </span>

              {statusMessage && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {statusMessage}
                </span>
              )}

              {previewOutput && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {errorMessage ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono flex-1 overflow-auto">
                {errorMessage}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto flex-1 max-h-[320px] border border-zinc-800 leading-relaxed select-all">
                {previewOutput || '// Result will appear here'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Click Apply to write changes directly to main JSON editor
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!previewOutput}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
