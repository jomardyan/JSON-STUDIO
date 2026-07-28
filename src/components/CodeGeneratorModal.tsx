import React from 'react';
import { X, Code2, Copy, Check, Download, Sparkles, Layers, FileCode } from 'lucide-react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { generateCodeModel, TargetLanguage } from '../utils/codeGenerators';

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputText: string;
  language?: SupportedLanguage;
}

interface LanguageOption {
  id: TargetLanguage;
  name: string;
  extension: string;
  variants?: { id: string; name: string }[];
  defaultVariant?: string;
  iconColor: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    variants: [
      { id: 'pydantic', name: 'Pydantic (BaseModel v2)' },
      { id: 'dataclass', name: '@dataclass' },
    ],
    defaultVariant: 'pydantic',
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    extension: '.go',
    iconColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    iconColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  },
  {
    id: 'csharp',
    name: 'C# / .NET',
    extension: '.cs',
    iconColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    variants: [
      { id: 'record', name: 'C# 9+ Record' },
      { id: 'class', name: 'Standard Class' },
    ],
    defaultVariant: 'record',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: '.kt',
    iconColor: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'java',
    name: 'Java',
    extension: '.java',
    iconColor: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
  {
    id: 'swift',
    name: 'Swift',
    extension: '.swift',
    iconColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'dart',
    name: 'Dart / Flutter',
    extension: '.dart',
    iconColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    variants: [
      { id: 'freezed', name: 'Freezed Model' },
      { id: 'class', name: 'JsonSerializable Class' },
    ],
    defaultVariant: 'freezed',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    iconColor: 'text-blue-600 bg-blue-600/10 border-blue-600/20',
    variants: [
      { id: 'interface', name: 'Interface' },
      { id: 'type', name: 'Type Alias' },
    ],
    defaultVariant: 'interface',
  },
];

export const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  inputText,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');
  const [selectedLang, setSelectedLang] = React.useState<TargetLanguage>('python');
  const [rootName, setRootName] = React.useState<string>('RootModel');
  const [variant, setVariant] = React.useState<string>('pydantic');
  const [generatedCode, setGeneratedCode] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  // Sync default variant when switching languages
  React.useEffect(() => {
    const langOpt = LANGUAGE_OPTIONS.find((l) => l.id === selectedLang);
    if (langOpt && langOpt.defaultVariant) {
      setVariant(langOpt.defaultVariant);
    } else {
      setVariant('');
    }
  }, [selectedLang]);

  // Generate code on change
  React.useEffect(() => {
    if (!isOpen) return;

    const { result, error } = generateCodeModel(inputText, selectedLang, {
      rootName,
      variant,
    });

    if (error) {
      setErrorMessage(error);
      setGeneratedCode('');
    } else {
      setErrorMessage(null);
      setGeneratedCode(result);
    }
  }, [isOpen, inputText, selectedLang, rootName, variant]);

  if (!isOpen) return null;

  const currentLangConfig = LANGUAGE_OPTIONS.find((l) => l.id === selectedLang)!;

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${rootName.toLowerCase()}${currentLangConfig.extension}`;
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
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Multi-Language Model Generator</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  9 SDK Languages
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Generate strongly typed data models (Python Pydantic, Go, Rust, C#, Kotlin, Java, Swift, Dart)
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 text-xs">
          {/* Settings Sidebar */}
          <div className="md:col-span-4 space-y-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pb-4 md:pb-0 md:pr-4">
            {/* Target Language Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                Target Language
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={`w-full p-2 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                      selectedLang === lang.id
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 opacity-80" />
                      <span>{lang.name}</span>
                    </span>
                    <span className="font-mono text-[10px] opacity-70">{lang.extension}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Root Model Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                Root Class / Struct Name
              </label>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="RootModel"
              />
            </div>

            {/* Framework / Variant Options */}
            {currentLangConfig.variants && currentLangConfig.variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Model Style / Framework
                </label>
                <div className="space-y-1">
                  {currentLangConfig.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariant(v.id)}
                      className={`w-full p-2 rounded-md border text-left transition-colors cursor-pointer flex items-center justify-between ${
                        variant === v.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{v.name}</span>
                      {variant === v.id && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Preview */}
          <div className="md:col-span-8 flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Generated {currentLangConfig.name} Source Code</span>
              </span>

              <div className="flex items-center gap-2">
                {generatedCode && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download {currentLangConfig.extension}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {errorMessage ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono flex-1 overflow-auto">
                {errorMessage}
              </div>
            ) : (
              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-100 font-mono text-xs overflow-auto flex-1 max-h-[420px] border border-zinc-800 leading-relaxed select-all">
                {generatedCode || '// Code model will be generated here'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Paste or load JSON in the main editor to auto-refresh model output
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
