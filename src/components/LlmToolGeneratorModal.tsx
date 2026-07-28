import React from 'react';
import { X, Sparkles, Copy, Check, Code, Bot, Cpu } from 'lucide-react';
import { generateLlmToolSpec, LlmSpecVariant } from '../utils/llmSpecGenerators';

interface LlmToolGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: any;
}

export const LlmToolGeneratorModal: React.FC<LlmToolGeneratorModalProps> = ({
  isOpen,
  onClose,
  jsonData,
}) => {
  const [variant, setVariant] = React.useState<LlmSpecVariant>('openai');
  const [toolName, setToolName] = React.useState('fetch_user_data');
  const [description, setDescription] = React.useState('Fetch user data payload from database');
  const [copied, setCopied] = React.useState(false);

  const jsonStr = React.useMemo(() => {
    return typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData, null, 2);
  }, [jsonData]);

  const specResult = React.useMemo(() => {
    return generateLlmToolSpec(jsonStr, variant, toolName, description);
  }, [jsonStr, variant, toolName, description]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (specResult.code) {
      navigator.clipboard.writeText(specResult.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>AI & LLM Structured Tool Spec Generator</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">
                  OpenAI & Gemini Ready
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate Function Tool Calling Specs & Zod Schemas for AI Agents
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Target Schema Format
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value as LlmSpecVariant)}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="openai">OpenAI Function Call Tool</option>
                <option value="gemini">Google Gemini Function Declaration</option>
                <option value="zod">Zod Schema (TypeScript)</option>
                <option value="typebox">TypeBox Schema (TypeScript)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Function / Tool Name
              </label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Tool Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Generated Output */}
          <div className="relative border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col min-h-[360px]">
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {variant === 'openai' && 'openai_tool_schema.json'}
                  {variant === 'gemini' && 'gemini_declaration_schema.json'}
                  {variant === 'zod' && 'schema.zod.ts'}
                  {variant === 'typebox' && 'schema.typebox.ts'}
                </span>
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Spec'}</span>
              </button>
            </div>

            <pre className="p-4 overflow-auto font-mono text-xs text-purple-200 flex-1 leading-relaxed">
              {specResult.error ? (
                <span className="text-rose-400">{specResult.error}</span>
              ) : (
                specResult.code
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
