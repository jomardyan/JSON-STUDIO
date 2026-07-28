import React from 'react';
import { X, FileCode2, Copy, Check, Terminal, Share2, Sparkles, Download, ArrowRight, Code } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import {
  generateOpenApiSchema,
  parseCurlAndGenerateSnippets,
  generateGraphQLSchema,
} from '../utils/apiSpecGenerators';

interface ApiSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyJsonToEditor?: (jsonText: string) => void;
  language?: SupportedLanguage;
}

export const ApiSpecModal: React.FC<ApiSpecModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyJsonToEditor,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [activeTab, setActiveTab] = React.useState<'openapi' | 'curl' | 'graphql'>('openapi');

  // OpenAPI state
  const [typeName, setTypeName] = React.useState<string>('ResponseModel');
  const [openApiFormat, setOpenApiFormat] = React.useState<'yaml' | 'json'>('yaml');
  const [openApiResult, setOpenApiResult] = React.useState<string>('');
  const [openApiError, setOpenApiError] = React.useState<string | null>(null);

  // cURL state
  const [curlInput, setCurlInput] = React.useState<string>(
    `curl -X POST https://api.example.com/v1/users \\\n  -H "Authorization: Bearer token123" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "Alice", "email": "alice@example.com", "role": "admin"}'`
  );
  const [snippetLang, setSnippetLang] = React.useState<'fetch' | 'axios' | 'python' | 'go'>('fetch');
  const [parsedCurlResult, setParsedCurlResult] = React.useState<any>(null);

  // GraphQL state
  const [gqlRootName, setGqlRootName] = React.useState<string>('User');
  const [gqlResult, setGqlResult] = React.useState<string>('');
  const [gqlError, setGqlError] = React.useState<string | null>(null);

  const [copied, setCopied] = React.useState<boolean>(false);

  // Re-run OpenAPI
  React.useEffect(() => {
    if (!isOpen || activeTab !== 'openapi') return;
    const { schemaJson, schemaYaml, error } = generateOpenApiSchema(inputText, typeName);
    if (error) {
      setOpenApiError(error);
      setOpenApiResult('');
    } else {
      setOpenApiError(null);
      setOpenApiResult(openApiFormat === 'yaml' ? schemaYaml : schemaJson);
    }
  }, [isOpen, activeTab, inputText, typeName, openApiFormat]);

  // Re-run cURL
  React.useEffect(() => {
    if (!isOpen || activeTab !== 'curl') return;
    const res = parseCurlAndGenerateSnippets(curlInput);
    setParsedCurlResult(res);
  }, [isOpen, activeTab, curlInput]);

  // Re-run GraphQL
  React.useEffect(() => {
    if (!isOpen || activeTab !== 'graphql') return;
    const { schema, error } = generateGraphQLSchema(inputText, gqlRootName);
    if (error) {
      setGqlError(error);
      setGqlResult('');
    } else {
      setGqlError(null);
      setGqlResult(schema);
    }
  }, [isOpen, activeTab, inputText, gqlRootName]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (text: string, filename: string) => {
    if (text) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>API & Specification Generators</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  OpenAPI / cURL / GraphQL
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate OpenAPI 3.0 schemas, parse cURL payloads, or infer GraphQL types
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

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('openapi')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'openapi'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>OpenAPI 3.0 / Swagger</span>
          </button>

          <button
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'curl'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL Parser & Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('graphql')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'graphql'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>GraphQL Schema</span>
          </button>
        </div>

        {/* Tab 1: OpenAPI 3.0 */}
        {activeTab === 'openapi' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Schema Type Name:
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Format:</span>
                <button
                  onClick={() => setOpenApiFormat('yaml')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                    openApiFormat === 'yaml'
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  YAML
                </button>
                <button
                  onClick={() => setOpenApiFormat('json')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                    openApiFormat === 'json'
                      ? 'bg-orange-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Generated OpenAPI 3.0 Specification</span>
              </span>

              {openApiResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(openApiResult)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(openApiResult, `openapi_schema.${openApiFormat}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download .{openApiFormat}</span>
                  </button>
                </div>
              )}
            </div>

            {openApiError ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono">
                {openApiError}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-80 border border-zinc-800 leading-relaxed select-all">
                {openApiResult}
              </pre>
            )}
          </div>
        )}

        {/* Tab 2: cURL Parser */}
        {activeTab === 'curl' && (
          <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 text-xs flex-1">
            {/* Input cURL Command */}
            <div className="md:col-span-5 space-y-2 flex flex-col">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Paste cURL Command
              </span>
              <textarea
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                className="w-full h-44 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
                placeholder="curl -X POST https://..."
              />

              {parsedCurlResult && parsedCurlResult.extractedJson && onApplyJsonToEditor && (
                <button
                  onClick={() => onApplyJsonToEditor(parsedCurlResult.extractedJson)}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Extract JSON Payload to Main Editor</span>
                </button>
              )}
            </div>

            {/* Generated Snippets */}
            <div className="md:col-span-7 space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Client Request Code Snippet
                </span>
                <div className="flex items-center gap-1">
                  {(['fetch', 'axios', 'python', 'go'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSnippetLang(lang)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer capitalize ${
                        snippetLang === lang
                          ? 'bg-orange-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {parsedCurlResult?.error ? (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono flex-1">
                  {parsedCurlResult.error}
                </div>
              ) : (
                <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-72 border border-zinc-800 leading-relaxed select-all">
                  {parsedCurlResult?.snippets?.[snippetLang]}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: GraphQL Schema */}
        {activeTab === 'graphql' && (
          <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                Root Type Name:
              </label>
              <input
                type="text"
                value={gqlRootName}
                onChange={(e) => setGqlRootName(e.target.value)}
                className="px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-semibold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Inferred GraphQL Schema Definitions</span>
              </span>

              {gqlResult && (
                <button
                  onClick={() => handleCopy(gqlResult)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Schema'}</span>
                </button>
              )}
            </div>

            {gqlError ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono">
                {gqlError}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-80 border border-zinc-800 leading-relaxed select-all">
                {gqlResult}
              </pre>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-end">
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
