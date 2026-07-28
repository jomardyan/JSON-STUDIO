import React from 'react';
import { X, Upload, FileText, Check, Download, Layers, Play, RefreshCw, FolderArchive, FileCode } from 'lucide-react';
import JSZip from 'jszip';
import { SupportedLanguage, getTranslation } from '../utils/i18n';
import { jsonToCsv } from '../utils/jsonUtils';
import { generateCodeModel } from '../utils/codeGenerators';

interface BatchFileItem {
  id: string;
  filename: string;
  originalSize: number;
  originalContent: string;
  convertedContent?: string;
  convertedFilename?: string;
  status: 'pending' | 'converted' | 'error';
  errorMessage?: string;
}

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySingleToEditor: (content: string) => void;
  language?: SupportedLanguage;
}

export const BatchProcessingModal: React.FC<BatchProcessingModalProps> = ({
  isOpen,
  onClose,
  onApplySingleToEditor,
  language = 'en',
}) => {
  const t = getTranslation((language as SupportedLanguage) || 'en');

  const [files, setFiles] = React.useState<BatchFileItem[]>([]);
  const [selectedAction, setSelectedAction] = React.useState<
    'format' | 'minify' | 'yaml' | 'csv' | 'xml' | 'ts' | 'sql'
  >('format');
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const newItems: BatchFileItem[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(uploadedFiles).forEach((file) => {
      if (!file.name.endsWith('.json') && file.type !== 'application/json' && !file.name.endsWith('.txt')) {
        return;
      }

      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            filename: file.name,
            originalSize: file.size,
            originalContent: content,
            status: 'pending',
          });
          resolve();
        };
        reader.readAsText(file);
      });
      readPromises.push(promise);
    });

    Promise.all(readPromises).then(() => {
      setFiles((prev) => [...prev, ...newItems]);
    });
  };

  const processBatch = () => {
    setIsProcessing(true);

    const updated = files.map((file) => {
      try {
        const parsed = JSON.parse(file.originalContent);
        let output = '';
        let ext = '.json';

        const tableName = file.filename.replace(/[^a-zA-Z0-9_]/g, '_').replace(/\.json$/i, '') || 'data_table';

        switch (selectedAction) {
          case 'format':
            output = JSON.stringify(parsed, null, 2);
            ext = '.formatted.json';
            break;
          case 'minify':
            output = JSON.stringify(parsed);
            ext = '.min.json';
            break;
          case 'yaml':
            output = simpleJsonToYaml(parsed);
            ext = '.yaml';
            break;
          case 'csv':
            output = jsonToCsv(parsed);
            ext = '.csv';
            break;
          case 'xml':
            output = simpleJsonToXml(parsed);
            ext = '.xml';
            break;
          case 'ts':
            output = generateCodeModel(file.originalContent, 'typescript').result;
            ext = '.d.ts';
            break;
          case 'sql':
            output = simpleJsonToSql(parsed, tableName);
            ext = '.sql';
            break;
        }

        const baseName = file.filename.substring(0, file.filename.lastIndexOf('.')) || file.filename;

        return {
          ...file,
          convertedContent: output,
          convertedFilename: `${baseName}${ext}`,
          status: 'converted' as const,
        };
      } catch (err: any) {
        return {
          ...file,
          status: 'error' as const,
          errorMessage: `Invalid JSON: ${err.message}`,
        };
      }
    });

    setFiles(updated);
    setIsProcessing(false);
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
    link.download = `batch_converted_${selectedAction}_files.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Multi-File Drag & Drop Batch Processor</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Batch Format & Convert
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Upload multiple JSON files simultaneously to format, minify, or convert into YAML/CSV/SQL/TS, then download as a ZIP bundle
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

        {/* Toolbar & Target Format Selector */}
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Target Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
            >
              <option value="format">Format (2 Spaces)</option>
              <option value="minify">Minify (1 Line)</option>
              <option value="yaml">Convert to YAML</option>
              <option value="csv">Convert to CSV</option>
              <option value="xml">Convert to XML</option>
              <option value="ts">Generate TypeScript Types</option>
              <option value="sql">Convert to SQL Statements</option>
            </select>

            <button
              onClick={processBatch}
              disabled={files.length === 0 || isProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Process Batch ({files.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {files.some((f) => f.status === 'converted') && (
              <button
                onClick={downloadAllZip}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All as .ZIP</span>
              </button>
            )}

            {files.length > 0 && (
              <button
                onClick={clearAll}
                className="px-2.5 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 cursor-pointer font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Content Body & Dropzone */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`p-6 border-2 border-dashed rounded-xl text-center transition-colors ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 hover:border-zinc-400'
            }`}
          >
            <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Drag & drop multiple .json files here, or click to browse
            </p>
            <p className="text-zinc-400 text-[11px] mt-1">Supports batch formatting and bulk format conversion</p>
            <input
              type="file"
              multiple
              accept=".json,.txt,application/json"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="batch-file-input"
            />
            <label
              htmlFor="batch-file-input"
              className="inline-block mt-3 px-4 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-lg cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Select Files
            </label>
          </div>

          {/* Files Table */}
          {files.length > 0 && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-2.5">File Name</th>
                    <th className="p-2.5">Original Size</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="p-2.5 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-500" />
                        <span>{file.filename}</span>
                      </td>
                      <td className="p-2.5 text-zinc-500">
                        {Math.round(file.originalSize / 1024 * 10) / 10} KB
                      </td>
                      <td className="p-2.5">
                        {file.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">
                            Pending
                          </span>
                        )}
                        {file.status === 'converted' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                            Converted ({file.convertedFilename})
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold" title={file.errorMessage}>
                            Error
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right space-x-2">
                        {file.status === 'converted' && file.convertedContent && (
                          <button
                            onClick={() => {
                              onApplySingleToEditor(file.convertedContent!);
                              onClose();
                            }}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                          >
                            Load in Editor
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Batch files are processed entirely in browser memory for privacy
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

function simpleJsonToYaml(obj: any, indent = 0): string {
  const pad = ' '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return obj.includes('\n') ? `|\n${pad}  ${obj.replace(/\n/g, `\n${pad}  `)}` : `"${obj.replace(/"/g, '\\"')}"`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map((item) => `${pad}- ${simpleJsonToYaml(item, indent + 2).trimStart()}`).join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys
      .map((k) => {
        const val = obj[k];
        if (typeof val === 'object' && val !== null) {
          return `${pad}${k}:\n${simpleJsonToYaml(val, indent + 2)}`;
        }
        return `${pad}${k}: ${simpleJsonToYaml(val, indent)}`;
      })
      .join('\n');
  }
  return String(obj);
}

function simpleJsonToXml(obj: any, rootTag = 'root'): string {
  function toXml(val: any, tag: string): string {
    if (val === null || val === undefined) return `<${tag}/>`;
    if (typeof val !== 'object') return `<${tag}>${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;

    if (Array.isArray(val)) {
      return val.map((item) => toXml(item, 'item')).join('\n');
    }

    const children = Object.keys(val)
      .map((k) => toXml(val[k], k))
      .join('\n');
    return `<${tag}>\n${children}\n</${tag}>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj, rootTag)}`;
}

function simpleJsonToSql(obj: any, tableName = 'data_table'): string {
  const rows = Array.isArray(obj) ? obj : [obj];
  if (rows.length === 0 || typeof rows[0] !== 'object' || !rows[0]) {
    return `-- No object records found to convert to SQL`;
  }

  const keys = Object.keys(rows[0]);
  const colList = keys.map((k) => `\`${k}\``).join(', ');

  const valuesStatements = rows
    .map((row) => {
      const vals = keys.map((k) => {
        const v = row[k];
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return v ? '1' : '0';
        if (typeof v === 'number') return String(v);
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      return `(${vals.join(', ')})`;
    })
    .join(',\n  ');

  return `INSERT INTO \`${tableName}\` (${colList})\nVALUES\n  ${valuesStatements};`;
}
