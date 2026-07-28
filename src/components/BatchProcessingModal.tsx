import React from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  FileText,
  FolderArchive,
  Play,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  detectFormatFromFilename,
  getFileExtensionForFormat,
  listFormatAdapters,
} from '../adapters/formatRegistry';
import { runWorkerTask } from '../utils/workerManager';

interface BatchFileItem {
  id: string;
  filename: string;
  originalSize: number;
  originalContent: string;
  sourceFormat: string;
  convertedContent?: string;
  convertedFilename?: string;
  status: 'pending' | 'processing' | 'converted' | 'error' | 'cancelled';
  errorMessage?: string;
  warnings?: string[];
}

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySingleToEditor: (content: string, format: string) => void;
  language?: string;
}

const MAX_FILES = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const WRITABLE_FORMATS = listFormatAdapters().filter((adapter) => adapter.writeSupport !== 'none');
const ACCEPTED_EXTENSIONS = Array.from(
  new Set(listFormatAdapters().flatMap((adapter) => adapter.extensions))
).join(',');

function replaceExtension(filename: string, extension: string): string {
  const slashIndex = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
  const dotIndex = filename.lastIndexOf('.');
  const base = dotIndex > slashIndex ? filename.slice(0, dotIndex) : filename;
  return `${base}${extension}`;
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
  onApplySingleToEditor,
}) => {
  const [files, setFiles] = React.useState<BatchFileItem[]>([]);
  const [selectedAction, setSelectedAction] = React.useState<'format' | 'minify' | 'convert'>('convert');
  const [targetFormat, setTargetFormat] = React.useState<string>('yaml');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [completedCount, setCompletedCount] = React.useState(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const addFiles = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const remainingSlots = Math.max(0, MAX_FILES - files.length);
    const selectedFiles = Array.from(uploadedFiles).slice(0, remainingSlots);
    const newItems = await Promise.all(
      selectedFiles.map(async (file): Promise<BatchFileItem> => {
        const sourceFormat = detectFormatFromFilename(file.name) || 'json';
        if (file.size > MAX_FILE_SIZE) {
          return {
            id: crypto.randomUUID(),
            filename: file.name,
            originalSize: file.size,
            originalContent: '',
            sourceFormat,
            status: 'error',
            errorMessage: 'File exceeds the 10 MB limit',
          };
        }

        try {
          const originalContent = await file.text();
          return {
            id: crypto.randomUUID(),
            filename: file.name,
            originalSize: file.size,
            originalContent,
            sourceFormat,
            status: 'pending',
          };
        } catch (error: unknown) {
          return {
            id: crypto.randomUUID(),
            filename: file.name,
            originalSize: file.size,
            originalContent: '',
            sourceFormat,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Failed to read file',
          };
        }
      })
    );

    setFiles((current) => [...current, ...newItems]);
  };

  const processBatch = async () => {
    const candidates = files.filter((file) => file.status !== 'error');
    if (!candidates.length) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsProcessing(true);
    setCompletedCount(0);
    setFiles((current) =>
      current.map((file) =>
        file.status === 'error' ? file : { ...file, status: 'processing', errorMessage: undefined }
      )
    );

    let completed = 0;
    const results = await Promise.all(
      files.map(async (file): Promise<BatchFileItem> => {
        if (file.status === 'error') return file;

        const response = await runWorkerTask(
          selectedAction === 'convert'
            ? {
                type: 'convert',
                input: file.originalContent,
                sourceFormat: file.sourceFormat,
                targetFormat,
                indent: 2,
              }
            : {
                type: selectedAction,
                input: file.originalContent,
                indent: 2,
              },
          {
            signal: controller.signal,
            timeoutMs: 30_000,
          }
        );

        completed += 1;
        setCompletedCount(completed);

        if (!response.success) {
          const cancelled = response.error === 'Task cancelled';
          return {
            ...file,
            status: cancelled ? 'cancelled' : 'error',
            errorMessage: response.error || 'Batch conversion failed',
          };
        }

        const extension =
          selectedAction === 'format' || selectedAction === 'minify'
            ? getFileExtensionForFormat(file.sourceFormat)
            : getFileExtensionForFormat(targetFormat);

        return {
          ...file,
          convertedContent: response.result || '',
          convertedFilename: replaceExtension(file.filename, extension),
          status: 'converted',
          warnings: response.warnings?.map((warning) => warning.message),
        };
      })
    );

    setFiles(results);
    setIsProcessing(false);
    abortControllerRef.current = null;
  };

  const cancelBatch = () => {
    abortControllerRef.current?.abort();
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      if (file.status === 'converted' && file.convertedContent && file.convertedFilename) {
        zip.file(file.convertedFilename, file.convertedContent);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `json-studio-batch-${selectedAction}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const completedFiles = files.filter((file) => file.status === 'converted');
  const processableCount = files.filter((file) => file.status !== 'error').length;
  const progress = processableCount ? Math.round((completedCount / processableCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={isProcessing ? undefined : onClose} />

      <div
        className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-processing-title"
      >
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 id="batch-processing-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Multi-Format Batch Processor
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Uses the shared adapter registry and conversion worker for up to {MAX_FILES} files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-40"
            aria-label="Close batch processor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedAction}
              onChange={(event) => setSelectedAction(event.target.value as 'format' | 'minify' | 'convert')}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              <option value="format">Format JSON</option>
              <option value="minify">Minify JSON</option>
              <option value="convert">Convert format</option>
            </select>

            {selectedAction === 'convert' && (
              <select
                value={targetFormat}
                onChange={(event) => setTargetFormat(event.target.value)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
              >
                {WRITABLE_FORMATS.map((adapter) => (
                  <option key={adapter.id} value={adapter.id}>
                    {adapter.name}
                  </option>
                ))}
              </select>
            )}

            {!isProcessing ? (
              <button
                onClick={processBatch}
                disabled={!files.some((file) => file.status !== 'error')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                Process {files.length || ''} files
              </button>
            ) : (
              <button
                onClick={cancelBatch}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {completedFiles.length > 0 && (
              <button
                onClick={downloadAllZip}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500"
              >
                <Download className="w-3.5 h-3.5" />
                Download ZIP
              </button>
            )}
            {files.length > 0 && !isProcessing && (
              <button
                onClick={() => {
                  setFiles([]);
                  setCompletedCount(0);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-zinc-500 hover:text-rose-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="px-5 py-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
              <span>Processing files</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <label
            className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400'
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragOver(false);
              void addFiles(event.dataTransfer.files);
            }}
          >
            <Upload className="w-6 h-6 text-indigo-500 mb-2" />
            <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">Drop supported data files here</span>
            <span className="text-[11px] text-zinc-500 mt-1">Maximum 10 MB per file and {MAX_FILES} files per batch</span>
            <input
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              disabled={isProcessing || files.length >= MAX_FILES}
              onChange={(event) => void addFiles(event.target.files)}
            />
          </label>

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-xs"
            >
              <FileText className="w-4 h-4 mt-0.5 text-zinc-400" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold truncate">{file.filename}</span>
                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">
                    {file.sourceFormat}
                  </span>
                  {file.status === 'converted' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  {(file.status === 'error' || file.status === 'cancelled') && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {(file.originalSize / 1024).toFixed(1)} KB - {file.status}
                </div>
                {file.errorMessage && <div className="mt-1 text-rose-600 dark:text-rose-400">{file.errorMessage}</div>}
                {file.warnings?.map((warning) => (
                  <div key={warning} className="mt-1 text-amber-600 dark:text-amber-400">
                    {warning}
                  </div>
                ))}
              </div>

              {file.convertedContent && (
                <button
                  onClick={() =>
                    onApplySingleToEditor(
                      file.convertedContent || '',
                      selectedAction === 'convert' ? targetFormat : file.sourceFormat
                    )
                  }
                  className="px-2.5 py-1 rounded bg-indigo-600 text-white font-semibold"
                >
                  Open
                </button>
              )}
              {!isProcessing && (
                <button
                  onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                  className="p-1 text-zinc-400 hover:text-rose-500"
                  aria-label={`Remove ${file.filename}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
