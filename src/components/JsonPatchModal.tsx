import React from 'react';
import { X, FileDiff, Check, Copy, ArrowRight, Plus, Minus, Edit3, Play, Download } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import {
  createRfc6902Patch,
  applyRfc6902Patch,
  createMergePatch,
  applyMergePatch,
  PatchOperation,
} from '../utils/jsonPatchEngine';

interface JsonPatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  onApplyResult: (resultText: string, actionName: string) => void;
  language?: SupportedLanguage;
}

export const JsonPatchModal: React.FC<JsonPatchModalProps> = ({
  isOpen,
  onClose,
  inputText,
  onApplyResult,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  // Mode: 'generate' | 'apply'
  const [activeTab, setActiveTab] = React.useState<'generate' | 'apply'>('generate');
  const [patchType, setPatchType] = React.useState<'rfc6902' | 'merge'>('rfc6902');

  // Generate state
  const [docA, setDocA] = React.useState<string>(inputText || '{\n  "title": "Document",\n  "version": 1,\n  "tags": ["v1"]\n}');
  const [docB, setDocB] = React.useState<string>('{\n  "title": "Updated Document",\n  "version": 2,\n  "tags": ["v1", "v2"],\n  "author": "Alice"\n}');
  const [generatedPatch, setGeneratedPatch] = React.useState<string>('');
  const [patchOpsCount, setPatchOpsCount] = React.useState<number>(0);

  // Apply state
  const [targetDoc, setTargetDoc] = React.useState<string>(inputText || '{\n  "title": "Document",\n  "version": 1\n}');
  const [patchInput, setPatchInput] = React.useState<string>(
    '[\n  { "op": "replace", "path": "/version", "value": 2 },\n  { "op": "add", "path": "/author", "value": "Bob" }\n]'
  );
  const [applyResultOutput, setApplyResultOutput] = React.useState<string>('');

  // Status/Error
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (inputText && isOpen) {
      setDocA(inputText);
      setTargetDoc(inputText);
    }
  }, [inputText, isOpen]);

  // Handle patch generation
  React.useEffect(() => {
    if (!isOpen || activeTab !== 'generate') return;

    if (patchType === 'rfc6902') {
      const { patchOps, patchString, error } = createRfc6902Patch(docA, docB);
      if (error) {
        setErrorMessage(error);
        setGeneratedPatch('');
        setPatchOpsCount(0);
      } else {
        setErrorMessage(null);
        setGeneratedPatch(patchString);
        setPatchOpsCount(patchOps.length);
      }
    } else {
      const { patchString, error } = createMergePatch(docA, docB);
      if (error) {
        setErrorMessage(error);
        setGeneratedPatch('');
        setPatchOpsCount(0);
      } else {
        setErrorMessage(null);
        setGeneratedPatch(patchString);
        setPatchOpsCount(1);
      }
    }
  }, [isOpen, activeTab, patchType, docA, docB]);

  // Handle patch application
  React.useEffect(() => {
    if (!isOpen || activeTab !== 'apply') return;

    if (patchType === 'rfc6902') {
      const { resultString, error } = applyRfc6902Patch(targetDoc, patchInput);
      if (error) {
        setErrorMessage(error);
        setApplyResultOutput('');
      } else {
        setErrorMessage(null);
        setApplyResultOutput(resultString);
      }
    } else {
      const { resultString, error } = applyMergePatch(targetDoc, patchInput);
      if (error) {
        setErrorMessage(error);
        setApplyResultOutput('');
      } else {
        setErrorMessage(null);
        setApplyResultOutput(resultString);
      }
    }
  }, [isOpen, activeTab, patchType, targetDoc, patchInput]);

  if (!isOpen) return null;

  const handleApplyToEditor = () => {
    if (activeTab === 'generate' && generatedPatch) {
      onApplyResult(generatedPatch, `Generated ${patchType.toUpperCase()} Patch`);
      onClose();
    } else if (activeTab === 'apply' && applyResultOutput) {
      onApplyResult(applyResultOutput, `Applied ${patchType.toUpperCase()} Patch`);
      onClose();
    }
  };

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <FileDiff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>JSON Patch (RFC 6902) & Merge Patch (RFC 7386)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Standards Compliance
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate atomic add/remove/replace operations array or apply RFC patches directly
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

        {/* Tab Header & Spec Selector */}
        <div className="px-5 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'generate'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              Generate Patch from Diff
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                activeTab === 'apply'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              Apply Patch Operations
            </button>
          </div>

          <div className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setPatchType('rfc6902')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                patchType === 'rfc6902'
                  ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              RFC 6902 (Ops Array)
            </button>
            <button
              onClick={() => setPatchType('merge')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                patchType === 'merge'
                  ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              RFC 7386 (Merge Patch)
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'generate' ? (
          <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 text-xs">
            {/* Doc A */}
            <div className="md:col-span-4 space-y-1.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Base Document A
              </span>
              <textarea
                value={docA}
                onChange={(e) => setDocA(e.target.value)}
                className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
                placeholder="Initial JSON..."
              />
            </div>

            {/* Doc B */}
            <div className="md:col-span-4 space-y-1.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Target Document B
              </span>
              <textarea
                value={docB}
                onChange={(e) => setDocB(e.target.value)}
                className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
                placeholder="Updated JSON..."
              />
            </div>

            {/* Generated Patch Result */}
            <div className="md:col-span-4 space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {patchType === 'rfc6902' ? 'RFC 6902 Patch Output' : 'Merge Patch Output'}
                </span>
                {generatedPatch && (
                  <button
                    onClick={() => handleCopy(generatedPatch)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {errorMessage ? (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono flex-1 overflow-auto">
                  {errorMessage}
                </div>
              ) : (
                <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-64 border border-zinc-800 leading-relaxed select-all">
                  {generatedPatch || '// Patch will be generated here'}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 text-xs">
            {/* Target Doc */}
            <div className="md:col-span-4 space-y-1.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                Target JSON Document
              </span>
              <textarea
                value={targetDoc}
                onChange={(e) => setTargetDoc(e.target.value)}
                className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
                placeholder="Target JSON..."
              />
            </div>

            {/* Patch Input */}
            <div className="md:col-span-4 space-y-1.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                {patchType === 'rfc6902' ? 'Paste RFC 6902 Patch Array' : 'Paste Merge Patch Object'}
              </span>
              <textarea
                value={patchInput}
                onChange={(e) => setPatchInput(e.target.value)}
                className="w-full h-64 p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs border border-zinc-800 resize-none leading-relaxed"
                placeholder={patchType === 'rfc6902' ? '[{"op": "add", "path": "/foo", "value": "bar"}]' : '{"foo": "bar"}'}
              />
            </div>

            {/* Apply Result Output */}
            <div className="md:col-span-4 space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Patched Result Document
                </span>
                {applyResultOutput && (
                  <button
                    onClick={() => handleCopy(applyResultOutput)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {errorMessage ? (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono flex-1 overflow-auto">
                  {errorMessage}
                </div>
              ) : (
                <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto h-64 border border-zinc-800 leading-relaxed select-all">
                  {applyResultOutput || '// Patched output will appear here'}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Click Apply to write changes directly to the main JSON editor
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyToEditor}
              disabled={Boolean(errorMessage) || (activeTab === 'generate' ? !generatedPatch : !applyResultOutput)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
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
