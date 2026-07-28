import React from 'react';
import { X, Globe, Download, Play, Check, Copy, ArrowRight, ShieldCheck, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface HeaderItem {
  key: string;
  value: string;
}

interface UrlFetcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyJsonToEditor: (jsonText: string) => void;
  language?: SupportedLanguage;
}

export const UrlFetcherModal: React.FC<UrlFetcherModalProps> = ({
  isOpen,
  onClose,
  onApplyJsonToEditor,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [urlInput, setUrlInput] = React.useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [headers, setHeaders] = React.useState<HeaderItem[]>([
    { key: 'Accept', value: 'application/json' },
  ]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [fetchedData, setFetchedData] = React.useState<string>('');
  const [responseStatus, setResponseStatus] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [
    { name: 'JSONPlaceholder Post', url: 'https://jsonplaceholder.typicode.com/posts/1' },
    { name: 'GitHub Octocat Profile', url: 'https://api.github.com/users/octocat' },
    { name: 'DummyJSON Product', url: 'https://dummyjson.com/products/1' },
    { name: 'Rick & Morty Character', url: 'https://rickandmortyapi.com/api/character/1' },
  ];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleFetch = async () => {
    if (!urlInput || !urlInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResponseStatus(null);
    setFetchedData('');

    try {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) {
          headerObj[h.key.trim()] = h.value.trim();
        }
      });

      const res = await fetch(urlInput.trim(), {
        method: 'GET',
        headers: headerObj,
      });

      setResponseStatus(res.status);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const formatted = JSON.stringify(json, null, 2);
      setFetchedData(formatted);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch API endpoint. Ensure CORS is enabled on the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (fetchedData) {
      navigator.clipboard.writeText(fetchedData);
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
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>URL & API Endpoint Fetcher</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Live Public GET Fetch
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fetch live JSON response from public REST endpoints with custom request headers
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

        {/* URL Input & Presets */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 space-y-3 text-xs">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 font-mono text-zinc-400 font-bold">GET</span>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://api.example.com/data.json"
                className="w-full pl-14 pr-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={isLoading || !urlInput.trim()}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Fetching...' : 'Fetch Live JSON'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 text-[11px] font-semibold">Test Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setUrlInput(p.url)}
                className="px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer font-medium"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Headers Editor */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">Request Headers</span>
              <button
                onClick={addHeader}
                className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Header</span>
              </button>
            </div>

            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header (e.g. Authorization)"
                  value={h.key}
                  onChange={(e) => {
                    const next = [...headers];
                    next[i].key = e.target.value;
                    setHeaders(next);
                  }}
                  className="w-1/3 px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Bearer token123)"
                  value={h.value}
                  onChange={(e) => {
                    const next = [...headers];
                    next[i].value = e.target.value;
                    setHeaders(next);
                  }}
                  className="flex-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                />
                <button
                  onClick={() => removeHeader(i)}
                  className="p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content Response View */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Response Payload
              </span>
              {responseStatus && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}>
                  Status: {responseStatus}
                </span>
              )}
            </div>

            {fetchedData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    onApplyJsonToEditor(fetchedData);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Load in Main Editor</span>
                </button>
              </div>
            )}
          </div>

          {errorMessage ? (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono">
              {errorMessage}
            </div>
          ) : (
            <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-64 border border-zinc-800 leading-relaxed select-all">
              {fetchedData || '// Live response payload will appear here after clicking Fetch'}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Note: Target endpoints must allow browser cross-origin requests (CORS)
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
