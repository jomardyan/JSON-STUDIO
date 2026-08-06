import React from 'react';
import {
  Code,
  Copy,
  Download,
  Upload,
  Trash2,
  Wrench,
  FileCode,
  FileSpreadsheet,
  FileText,
  Check,
  Search,
  Sparkles,
  ArrowRightLeft,
  Maximize2,
  Table as TableIcon,
  FolderOpen,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  Eraser,
  Quote,
  Binary,
  Layers,
  FileCode2,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Database,
  GitCompare,
  Wand2,
  ShieldAlert,
  KeyRound,
  Code2,
  Terminal,
  FileDiff,
  Network,
  BarChart3,
  FolderArchive,
  Github,
} from 'lucide-react';

import {
  DataFormat,
  OutputViewMode,
  Theme,
  UserPreferences,
  HistoryItem,
  ValidationError,
  TransformationStats,
} from './types';
import {
  validateJson,
  formatJson,
  minifyJson,
  repairJson,
  jsonToCsv,
  csvToJson,
  jsonToXml,
  xmlToJson,
  calculateStats,
  sortJsonKeys,
  removeEmptyValues,
  escapeJson,
  unescapeJson,
  encodeBase64,
  decodeBase64,
  flattenJson,
  unflattenJson,
  generateJsonSchema,
  jsonToYaml,
  jsonToSql,
  sqlToJson,
  jsonToHtmlTable,
  jsonToUrlEncoded,
  urlEncodedToJson,
  jsonToProperties,
  propertiesToJson,
  jsonToTsInterface,
  jsonToToml,
  tomlToJson,
  jsonToMarkdownTable,
  markdownTableToJson,
  jsonToNdjson,
  ndjsonToJson,
  jsonToPythonDict,
  jsonToPhpArray,
  detectFormat,
} from './utils/jsonUtils';
import { SAMPLE_DATASETS, SampleItem } from './utils/samples';
import {
  getHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory as clearHistoryStorage,
  getSavedTheme,
  saveTheme,
  getUserPreferences,
  saveUserPreferences,
} from './utils/storage';
import { SupportedLanguage, getTranslation } from './utils/i18n';

import { Header } from './components/Header';
import { SyntaxHighlighter } from './components/SyntaxHighlighter';
import { TreeView } from './components/TreeView';
import { TableView } from './components/TableView';
import { StatsBar } from './components/StatsBar';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { ChangelogModal } from './components/ChangelogModal';
import { SqlConverterModal } from './components/SqlConverterModal';
import { JsonDiffModal } from './components/JsonDiffModal';
import { JsonTransformToolsModal } from './components/JsonTransformToolsModal';
import { CodeGeneratorModal } from './components/CodeGeneratorModal';
import { JqQueryModal } from './components/JqQueryModal';
import { JsonPatchModal } from './components/JsonPatchModal';
import { ApiSpecModal } from './components/ApiSpecModal';
import { JwtDecoderModal } from './components/JwtDecoderModal';
import { ObjectGraphModal } from './components/ObjectGraphModal';
import { PayloadProfilerModal } from './components/PayloadProfilerModal';
import { BatchProcessingModal } from './components/BatchProcessingModal';
import { UrlFetcherModal } from './components/UrlFetcherModal';
import { JsonChartsModal } from './components/JsonChartsModal';
import { LlmToolGeneratorModal } from './components/LlmToolGeneratorModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ConversionMatrixModal } from './components/ConversionMatrixModal';
import { deduplicateJsonArray, flattenNestedArray, isChartableData } from './utils/jsonUtils';
import {
  convertFormat,
  detectFormatFromFilename,
  getFileExtensionForFormat,
  getFormatAdapter,
  listFormatAdapters,
} from './adapters/formatRegistry';
import { APP_VERSION, HOMEPAGE_DOMAIN, HOMEPAGE_URL } from './config/version';

const READABLE_FORMATS = listFormatAdapters().filter((adapter) => adapter.readSupport !== 'none');
const WRITABLE_FORMATS = listFormatAdapters().filter((adapter) => adapter.writeSupport !== 'none');

function getOutputLanguage(format: string): 'json' | 'xml' | 'csv' | 'text' {
  if (format === 'json' || format === 'json5' || format === 'ndjson') return 'json';
  if (format === 'xml' || format === 'html') return 'xml';
  if (format === 'csv') return 'csv';
  return 'text';
}

export default function App() {
  // Theme state
  const [theme, setTheme] = React.useState<Theme>(getSavedTheme);

  // Network & Offline Mode state
  const [isOffline, setIsOffline] = React.useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Command Palette & Shortcuts state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = React.useState<boolean>(false);

  // Preferences
  const [preferences, setPreferences] = React.useState<UserPreferences>(getUserPreferences);
  const currentLanguage: SupportedLanguage = preferences.language || 'en';
  const t = getTranslation(currentLanguage);

  // Input state
  const [inputFormat, setInputFormat] = React.useState<DataFormat>('json');
  const [inputText, setInputText] = React.useState<string>(SAMPLE_DATASETS[0].content);

  // Output state
  const [outputText, setOutputText] = React.useState<string>('');
  const [outputLanguage, setOutputLanguage] = React.useState<'json' | 'xml' | 'csv' | 'text'>('json');
  const [outputViewMode, setOutputViewMode] = React.useState<OutputViewMode>('code');
  const [parsedData, setParsedData] = React.useState<any>(null);
  const [activeActionTitle, setActiveActionTitle] = React.useState<string>('Formatted JSON');
  const [lastProcessedInput, setLastProcessedInput] = React.useState<string>(inputText);

  // Validation & Error state
  const [isValid, setIsValid] = React.useState<boolean>(true);
  const [error, setError] = React.useState<ValidationError | null>(null);

  // Search/filter in output
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // History state
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>(getHistory);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = React.useState<boolean>(false);

  // Changelog modal state
  const [isChangelogOpen, setIsChangelogOpen] = React.useState<boolean>(false);

  // SQL Studio Modal state
  const [isSqlModalOpen, setIsSqlModalOpen] = React.useState<boolean>(false);

  // JSON Diff Modal state
  const [isDiffModalOpen, setIsDiffModalOpen] = React.useState<boolean>(false);

  // Advanced Transform Tools Modal state
  const [isTransformToolsOpen, setIsTransformToolsOpen] = React.useState<boolean>(false);

  // Multi-Language Code Generator Modal state
  const [isCodeGeneratorOpen, setIsCodeGeneratorOpen] = React.useState<boolean>(false);

  // jq Syntax Query Modal state
  const [isJqModalOpen, setIsJqModalOpen] = React.useState<boolean>(false);

  // JSON Patch & Merge Patch Modal state
  const [isPatchModalOpen, setIsPatchModalOpen] = React.useState<boolean>(false);

  // OpenAPI / cURL / GraphQL Spec Generator state
  const [isApiSpecOpen, setIsApiSpecOpen] = React.useState<boolean>(false);

  // JWT Inspector & Decoder Modal state
  const [isJwtModalOpen, setIsJwtModalOpen] = React.useState<boolean>(false);

  // Object Graph ER Visualizer state
  const [isObjectGraphOpen, setIsObjectGraphOpen] = React.useState<boolean>(false);

  // Payload Profiler & Stats Inspector state
  const [isProfilerOpen, setIsProfilerOpen] = React.useState<boolean>(false);

  // Drag & Drop Batch Processor state
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState<boolean>(false);

  // URL / API Endpoint Fetcher state
  const [isUrlFetcherOpen, setIsUrlFetcherOpen] = React.useState<boolean>(false);

  // Visual Charts Studio state
  const [isChartsOpen, setIsChartsOpen] = React.useState<boolean>(false);

  // AI & LLM Structured Spec state
  const [isLlmSpecOpen, setIsLlmSpecOpen] = React.useState<boolean>(false);

  // Conversion Matrix Studio state
  const [isMatrixModalOpen, setIsMatrixModalOpen] = React.useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  // Drag and drop state
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  // Target output format for cross conversion
  const [targetOutputFormat, setTargetOutputFormat] = React.useState<DataFormat>('xml');
  const [showMoreTools, setShowMoreTools] = React.useState<boolean>(false);
  const [autoDetectFormat, setAutoDetectFormat] = React.useState<boolean>(true);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showInstallButton, setShowInstallButton] = React.useState<boolean>(false);

  // Privacy Banner State
  const [showPrivacyBanner, setShowPrivacyBanner] = React.useState<boolean>(
    () => {
      try {
        return localStorage.getItem('privacyConsent') !== 'true';
      } catch {
        return true;
      }
    }
  );

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    setDeferredPrompt(null);
  };

  const handlePrivacyAccept = () => {
    try {
      localStorage.setItem('privacyConsent', 'true');
    } catch {
      // The acknowledgement remains valid for this session if storage is unavailable.
    }
    setShowPrivacyBanner(false);
  };

  // Cross conversion executor
  const runCrossConversion = React.useCallback(
    (fromFmt: DataFormat, toFmt: DataFormat) => {
      if (!inputText.trim()) {
        setOutputText('');
        setParsedData(null);
        setIsValid(true);
        setError(null);
        return;
      }

      const conversion = convertFormat(inputText, fromFmt, toFmt, preferences.indent, {
        csvOptions: preferences.csvOptions,
        xmlOptions: preferences.xmlOptions,
        sqlOptions: preferences.sqlOptions,
      });
      const result = conversion.outputText;
      const convErr = conversion.errors[0]?.message;
      const parsed = conversion.parsedObj;
      const lang = getOutputLanguage(toFmt);

      const formatNames: Record<DataFormat, string> = {
        json: 'JSON',
        xml: 'XML',
        csv: 'CSV',
        yaml: 'YAML',
        toml: 'TOML',
        sql: 'SQL INSERT',
        html: 'HTML Table',
        markdown: 'Markdown Table',
        urlencoded: 'URL Query',
        properties: '.env / Properties',
        'ts-interface': 'TypeScript',
        ndjson: 'NDJSON',
        python: 'Python Dict',
        php: 'PHP Array',
        ini: 'INI Config',
        hcl: 'HCL / Terraform',
        json5: 'JSON5 / JSONC',
        env: 'Dotenv Environment',
      };

      const title = `${formatNames[fromFmt] || fromFmt.toUpperCase()} ➔ ${formatNames[toFmt] || toFmt.toUpperCase()}`;

      setOutputText(result);
      setOutputLanguage(lang);
      setActiveActionTitle(title);
      setLastProcessedInput(inputText);

      if (convErr) {
        setIsValid(false);
        setError({ message: convErr });
        setParsedData(null);
      } else {
        setIsValid(true);
        setError(null);
        setParsedData(parsed || null);

        saveHistoryItem({
          title,
          inputFormat: fromFmt,
          outputFormat: toFmt,
          inputText,
          outputText: result,
          inputSizeBytes: new Blob([inputText]).size,
          outputSizeBytes: new Blob([result]).size,
          valid: true,
        });
        setHistoryItems(getHistory());
      }
    },
    [inputText, preferences]
  );

  // Input textarea line-number scrolling sync
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const handleInputScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const inputLinesCount = React.useMemo(() => {
    if (!inputText) return 1;
    return inputText.split('\n').length;
  }, [inputText]);

  // Apply theme class to <html> element
  React.useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const useDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      root.classList.toggle('dark', useDark);
    };

    applyTheme();
    saveTheme(theme);

    if (theme !== 'system') return;
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  // Initial format on load
  React.useEffect(() => {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action === 'csv') {
      handleFormat('to-csv');
    } else if (action === 'sql') {
      setIsSqlModalOpen(true);
      handleFormat('format');
    } else {
      handleFormat('format');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Perform format / minify / repair / convert / utility operations
  const handleFormat = React.useCallback(
    (
      actionType:
        | 'format'
        | 'minify'
        | 'repair'
        | 'sort-asc'
        | 'sort-desc'
        | 'clean'
        | 'escape'
        | 'unescape'
        | 'b64-encode'
        | 'b64-decode'
        | 'flatten'
        | 'unflatten'
        | 'to-schema'
        | 'dedupe-array'
        | 'flatten-nested-array'
        | 'to-yaml'
        | 'to-csv'
        | 'to-xml'
        | 'to-sql'
        | 'sql-to-json'
        | 'to-html'
        | 'to-urlencoded'
        | 'urlencoded-to-json'
        | 'to-properties'
        | 'properties-to-json'
        | 'to-ts-interface'
        | 'to-toml'
        | 'toml-to-json'
        | 'csv-to-json'
        | 'xml-to-json'
    ) => {
      let resultText = '';
      let lang: 'json' | 'xml' | 'csv' | 'text' = 'json';
      let title = '';
      let parsedObj: any = null;
      let validState = true;
      let errDetail: ValidationError | null = null;

      if (!inputText.trim()) {
        setOutputText('');
        setParsedData(null);
        setIsValid(true);
        setError(null);
        return;
      }

      try {
        if (actionType === 'format') {
          if (inputFormat === 'toml') {
            title = 'TOML ➔ JSON';
            lang = 'json';
            const { result, error: tomlErr } = tomlToJson(inputText, preferences.indent);
            resultText = result;
            if (tomlErr) {
              validState = false;
              errDetail = { message: `TOML Parse Error: ${tomlErr}` };
            } else {
              const val = validateJson(resultText);
              validState = val.valid;
              errDetail = val.error;
              parsedObj = val.parsed;
            }
          } else if (inputFormat === 'properties') {
            title = 'Properties ➔ JSON';
            lang = 'json';
            const { result, error: propErr } = propertiesToJson(inputText, preferences.indent);
            resultText = result;
            if (propErr) {
              validState = false;
              errDetail = { message: `Properties Parse Error: ${propErr}` };
            } else {
              const val = validateJson(resultText);
              validState = val.valid;
              errDetail = val.error;
              parsedObj = val.parsed;
            }
          } else if (inputFormat === 'urlencoded') {
            title = 'URL Query ➔ JSON';
            lang = 'json';
            const { result } = urlEncodedToJson(inputText, preferences.indent);
            resultText = result;
            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
          } else if (inputFormat === 'csv') {
            title = 'CSV ➔ JSON';
            lang = 'json';
            parsedObj = csvToJson(inputText, preferences.csvOptions);
            const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
            resultText = JSON.stringify(parsedObj, null, indentSpace);
          } else if (inputFormat === 'xml') {
            title = 'XML ➔ JSON';
            lang = 'json';
            parsedObj = xmlToJson(inputText);
            const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
            resultText = JSON.stringify(parsedObj, null, indentSpace);
          } else if (inputFormat === 'ndjson') {
            title = 'NDJSON ➔ JSON';
            lang = 'json';
            const { result, error: ndErr } = ndjsonToJson(inputText, preferences.indent);
            resultText = result;
            if (ndErr) {
              validState = false;
              errDetail = { message: `NDJSON Parse Error: ${ndErr}` };
            } else {
              const val = validateJson(resultText);
              validState = val.valid;
              errDetail = val.error;
              parsedObj = val.parsed;
            }
          } else if (inputFormat === 'sql') {
            title = 'SQL ➔ JSON';
            lang = 'json';
            const { result, error: sqlErr } = sqlToJson(inputText, preferences.indent);
            resultText = result;
            if (sqlErr) {
              validState = false;
              errDetail = { message: `SQL Parse Error: ${sqlErr}` };
            } else {
              const val = validateJson(resultText);
              validState = val.valid;
              errDetail = val.error;
              parsedObj = val.parsed;
            }
          } else if (inputFormat === 'markdown') {
            title = 'Markdown ➔ JSON';
            lang = 'json';
            const { result, error: mdErr } = markdownTableToJson(inputText, preferences.indent);
            resultText = result;
            if (mdErr) {
              validState = false;
              errDetail = { message: `Markdown Parse Error: ${mdErr}` };
            } else {
              const val = validateJson(resultText);
              validState = val.valid;
              errDetail = val.error;
              parsedObj = val.parsed;
            }
          } else if (inputFormat === 'python' || inputFormat === 'php') {
            title = `${inputFormat.toUpperCase()} ➔ JSON`;
            lang = 'json';
            const rep = repairJson(inputText);
            resultText = rep.repaired;
            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
          } else if (inputFormat === 'yaml') {
            title = 'YAML ➔ JSON';
            lang = 'json';
            const conversion = convertFormat(inputText, 'yaml', 'json', preferences.indent);
            resultText = conversion.outputText;
            if (!conversion.valid) {
              validState = false;
              errDetail = { message: `YAML Parse Error: ${conversion.errors[0]?.message || 'Invalid YAML'}` };
            } else {
              validState = true;
              errDetail = null;
              parsedObj = conversion.parsedObj;
            }
          } else {
            title = 'Formatted JSON';
            lang = 'json';

            if (preferences.autoSortKeysOnFormat) {
              const { result } = sortJsonKeys(inputText, 'asc', preferences.indent);
              resultText = result;
            } else {
              const { result } = formatJson(inputText, preferences.indent);
              resultText = result;
            }

            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
          }
        } else if (actionType === 'minify') {
          title = 'Minified JSON';
          lang = 'json';
          const { result } = minifyJson(inputText);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'repair') {
          title = 'Repaired JSON';
          lang = 'json';
          const { repaired, fixed, message } = repairJson(inputText);
          resultText = repaired;
          setInputText(repaired);

          const val = validateJson(repaired);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;

          showToast(message);
        } else if (actionType === 'sort-asc') {
          title = 'Sorted Keys (A-Z)';
          lang = 'json';
          const { result, error: sortErr } = sortJsonKeys(inputText, 'asc', preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error || (sortErr ? { message: sortErr } : null);
          parsedObj = val.parsed;
        } else if (actionType === 'sort-desc') {
          title = 'Sorted Keys (Z-A)';
          lang = 'json';
          const { result, error: sortErr } = sortJsonKeys(inputText, 'desc', preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error || (sortErr ? { message: sortErr } : null);
          parsedObj = val.parsed;
        } else if (actionType === 'clean') {
          title = 'Cleaned JSON (No Nulls/Empty)';
          lang = 'json';
          const { result, error: cleanErr } = removeEmptyValues(inputText, { removeNulls: true, removeEmptyStrings: true }, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error || (cleanErr ? { message: cleanErr } : null);
          parsedObj = val.parsed;
        } else if (actionType === 'escape') {
          title = 'Escaped JSON String';
          lang = 'text';
          const { result } = escapeJson(inputText);
          resultText = result;
          validState = true;
        } else if (actionType === 'unescape') {
          title = 'Unescaped JSON';
          lang = 'json';
          const { result } = unescapeJson(inputText, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'b64-encode') {
          title = 'Base64 Encoded';
          lang = 'text';
          const { result } = encodeBase64(inputText);
          resultText = result;
          validState = true;
        } else if (actionType === 'b64-decode') {
          title = 'Base64 Decoded';
          lang = 'json';
          const { result } = decodeBase64(inputText, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'flatten') {
          title = 'Flattened JSON Keys';
          lang = 'json';
          const { result } = flattenJson(inputText, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'unflatten') {
          title = 'Unflattened JSON';
          lang = 'json';
          const { result } = unflattenJson(inputText, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'to-schema') {
          title = 'JSON Schema (Draft-07)';
          lang = 'json';
          const { result } = generateJsonSchema(inputText, preferences.indent);
          resultText = result;

          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'dedupe-array') {
          title = 'Deduplicated Array';
          lang = 'json';
          const { result, count, error: dedupeErr } = deduplicateJsonArray(inputText, preferences.indent);
          resultText = result;
          if (dedupeErr) {
            validState = false;
            errDetail = { message: dedupeErr };
          } else {
            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
            showToast(`Removed ${count} duplicate item${count === 1 ? '' : 's'}`);
          }
        } else if (actionType === 'flatten-nested-array') {
          title = 'Flattened Array';
          lang = 'json';
          const { result, error: flatErr } = flattenNestedArray(inputText, preferences.indent);
          resultText = result;
          if (flatErr) {
            validState = false;
            errDetail = { message: flatErr };
          } else {
            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
          }
        } else if (actionType === 'to-yaml') {
          title = 'JSON to YAML';
          lang = 'text';
          const { result } = jsonToYaml(inputText);
          resultText = result;
          validState = true;
        } else if (actionType === 'to-csv') {
          title = 'JSON to CSV';
          lang = 'csv';
          const val = validateJson(inputText);
          if (!val.valid) {
            validState = false;
            errDetail = val.error;
            resultText = '// Cannot convert invalid JSON to CSV. Please fix syntax errors first.';
          } else {
            parsedObj = val.parsed;
            resultText = jsonToCsv(parsedObj, preferences.csvOptions);
          }
        } else if (actionType === 'to-xml') {
          title = 'JSON to XML';
          lang = 'xml';
          const val = validateJson(inputText);
          if (!val.valid) {
            validState = false;
            errDetail = val.error;
            resultText = '<!-- Cannot convert invalid JSON to XML. Please fix syntax errors first. -->';
          } else {
            parsedObj = val.parsed;
            resultText = jsonToXml(parsedObj, preferences.xmlOptions);
          }
        } else if (actionType === 'to-sql') {
          title = 'JSON to SQL Script';
          lang = 'text';
          const { result, error: sqlErr } = jsonToSql(inputText, preferences.sqlOptions);
          resultText = result;
          if (sqlErr) {
            validState = false;
            errDetail = { message: sqlErr };
          }
        } else if (actionType === 'sql-to-json') {
          title = 'SQL to JSON';
          lang = 'json';
          const { result, error: sqlJsonErr } = sqlToJson(inputText, preferences.indent);
          resultText = result;
          if (sqlJsonErr) {
            validState = false;
            errDetail = { message: sqlJsonErr };
          } else {
            const val = validateJson(resultText);
            validState = val.valid;
            errDetail = val.error;
            parsedObj = val.parsed;
          }
        } else if (actionType === 'to-html') {
          title = 'JSON to HTML Table';
          lang = 'xml';
          const { result, error: htmlErr } = jsonToHtmlTable(inputText);
          resultText = result;
          if (htmlErr) {
            validState = false;
            errDetail = { message: htmlErr };
          }
        } else if (actionType === 'to-urlencoded') {
          title = 'JSON to URL Query String';
          lang = 'text';
          const { result, error: urlErr } = jsonToUrlEncoded(inputText);
          resultText = result;
          if (urlErr) {
            validState = false;
            errDetail = { message: urlErr };
          }
        } else if (actionType === 'urlencoded-to-json') {
          title = 'URL Query to JSON';
          lang = 'json';
          const { result } = urlEncodedToJson(inputText, preferences.indent);
          resultText = result;
          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'to-properties') {
          title = 'JSON to .properties / .env';
          lang = 'text';
          const { result, error: propErr } = jsonToProperties(inputText);
          resultText = result;
          if (propErr) {
            validState = false;
            errDetail = { message: propErr };
          }
        } else if (actionType === 'properties-to-json') {
          title = '.properties / .env to JSON';
          lang = 'json';
          const { result } = propertiesToJson(inputText, preferences.indent);
          resultText = result;
          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'to-ts-interface') {
          title = 'JSON to TypeScript Interfaces';
          lang = 'text';
          const { result, error: tsErr } = jsonToTsInterface(inputText, 'RootObject');
          resultText = result;
          if (tsErr) {
            validState = false;
            errDetail = { message: tsErr };
          }
        } else if (actionType === 'to-toml') {
          title = 'JSON to TOML';
          lang = 'text';
          const { result, error: tomlErr } = jsonToToml(inputText);
          resultText = result;
          if (tomlErr) {
            validState = false;
            errDetail = { message: tomlErr };
          }
        } else if (actionType === 'toml-to-json') {
          title = 'TOML to JSON';
          lang = 'json';
          const { result } = tomlToJson(inputText, preferences.indent);
          resultText = result;
          const val = validateJson(resultText);
          validState = val.valid;
          errDetail = val.error;
          parsedObj = val.parsed;
        } else if (actionType === 'csv-to-json') {
          title = 'CSV to JSON';
          lang = 'json';
          parsedObj = csvToJson(inputText, preferences.csvOptions);
          const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
          resultText = JSON.stringify(parsedObj, null, indentSpace);
        } else if (actionType === 'xml-to-json') {
          title = 'XML to JSON';
          lang = 'json';
          parsedObj = xmlToJson(inputText);
          const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
          resultText = JSON.stringify(parsedObj, null, indentSpace);
        }

        // Update output state
        setOutputText(resultText);
        setOutputLanguage(lang);
        setActiveActionTitle(title);
        setParsedData(parsedObj);
        setIsValid(validState);
        setError(errDetail);
        setLastProcessedInput(actionType === 'repair' ? resultText : inputText);

        // Save to persistent history if valid output
        if (resultText && validState) {
          saveHistoryItem({
            title,
            inputFormat,
            outputFormat: lang as any,
            inputText,
            outputText: resultText,
            inputSizeBytes: new Blob([inputText]).size,
            outputSizeBytes: new Blob([resultText]).size,
            valid: validState,
          });
          setHistoryItems(getHistory());
        }
      } catch (err: any) {
        setIsValid(false);
        setError({
          message: err.message || 'Transformation failed',
        });
        showToast(`Error: ${err.message || 'Operation failed'}`);
      }
    },
    [inputText, preferences, inputFormat]
  );


  // Validate input according to input format
  const validateInputByFormat = React.useCallback((text: string, fmt: DataFormat) => {
    if (!text.trim()) {
      setIsValid(true);
      setError(null);
      return;
    }

    const adapter = getFormatAdapter(fmt);
    if (!adapter || adapter.readSupport === 'none') {
      setIsValid(false);
      setError({ message: `${adapter?.name || fmt} cannot be used as an input format` });
      return;
    }

    const result = adapter.parse(text, {
      csvOptions: preferences.csvOptions,
      xmlOptions: preferences.xmlOptions,
      sqlOptions: preferences.sqlOptions,
    });
    setIsValid(result.valid);
    setError(result.valid ? null : { message: result.error || `Invalid ${adapter.name}` });
  }, [preferences.csvOptions, preferences.sqlOptions, preferences.xmlOptions]);

  // Validate on input edit
  const handleInputChange = React.useCallback(
    (val: string, overrideFmt?: DataFormat) => {
      setInputText(val);
      let targetFmt = overrideFmt || inputFormat;

      if (!overrideFmt && autoDetectFormat && val.trim().length > 2) {
        const detected = detectFormat(val);
        if (detected !== inputFormat) {
          targetFmt = detected;
          setInputFormat(detected);
        }
      }

      validateInputByFormat(val, targetFmt);
    },
    [autoDetectFormat, inputFormat, validateInputByFormat]
  );

  // Copy output to clipboard
  const handleCopyOutput = React.useCallback(async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      showToast('Copied output to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast('Clipboard access was blocked by the browser');
    }
  }, [outputText]);

  // Swap output text back into input
  const handleSwapOutputToInput = React.useCallback(() => {
    if (!outputText.trim()) {
      showToast('Output is empty — nothing to swap');
      return;
    }
    setInputText(outputText);
    setLastProcessedInput(outputText);
    let targetFmt: DataFormat = 'json';
    if (outputLanguage === 'xml') targetFmt = 'xml';
    else if (outputLanguage === 'csv') targetFmt = 'csv';

    setInputFormat(targetFmt);
    validateInputByFormat(outputText, targetFmt);
    showToast('Swapped Output ➔ Input Editor');
  }, [outputText, outputLanguage, validateInputByFormat]);

  // Count search query matches in output
  const searchMatchesCount = React.useMemo(() => {
    if (!searchQuery.trim() || !outputText) return 0;
    try {
      const q = searchQuery.toLowerCase();
      const str = outputText.toLowerCase();
      let count = 0;
      let pos = str.indexOf(q);
      while (pos !== -1) {
        count++;
        pos = str.indexOf(q, pos + q.length);
      }
      return count;
    } catch {
      return 0;
    }
  }, [searchQuery, outputText]);

  // Network Online / Offline Listener
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Network Connected — Online Mode');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Working Offline — 100% Client-Side Engine Active');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInputting = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Open Command Palette: Ctrl+K or Cmd+K or Ctrl+P or Cmd+P
      if (isMod && (e.key === 'k' || e.key === 'K' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Open Keyboard Shortcuts Modal: Ctrl+/ or Cmd+/
      if (isMod && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Esc closes open modals
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          return;
        }
      }

      // Hotkeys
      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        handleFormat('format');
        showToast('Shortcut: Format JSON (Ctrl+Enter)');
      } else if (isMod && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        handleFormat('minify');
        showToast('Shortcut: Minify JSON (Ctrl+Shift+M)');
      } else if (isMod && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        handleFormat('repair');
        showToast('Shortcut: Auto-Repair (Ctrl+Shift+R)');
      } else if (isMod && e.shiftKey && (e.key === 'C' || e.key === 'c') && !isInputting) {
        e.preventDefault();
        handleCopyOutput();
      } else if (isMod && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        handleSwapOutputToInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen, handleFormat, handleSwapOutputToInput, handleCopyOutput]);

  // Download output file
  const handleDownload = () => {
    if (!outputText) return;

    let extension = 'json';
    const ext = getFileExtensionForFormat(activeActionTitle || outputLanguage);
    const filename = `converted_data_${Date.now()}${ext}`;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}`);
  };

  // File upload handler
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const filenameFormat = detectFormatFromFilename(file.name);
        const fmt = (filenameFormat || detectFormat(content)) as DataFormat;

        setInputText(content);
        setInputFormat(fmt);
        validateInputByFormat(content, fmt);

        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Drag & drop file event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Load sample dataset
  const handleSelectSample = (sample: SampleItem) => {
    setInputText(sample.content);
    setInputFormat(sample.format);
    validateInputByFormat(sample.content, sample.format);

    // Auto-transform sample dataset to output
    let resultText = '';
    let parsedObj: any = null;
    let validState = true;
    let errDetail: ValidationError | null = null;

    if (sample.format === 'toml') {
      const { result, error: tomlErr } = tomlToJson(sample.content, preferences.indent);
      resultText = result;
      if (tomlErr) {
        validState = false;
        errDetail = { message: `TOML Parse Error: ${tomlErr}` };
      } else {
        const val = validateJson(resultText);
        validState = val.valid;
        errDetail = val.error;
        parsedObj = val.parsed;
      }
      setActiveActionTitle('TOML ➔ JSON');
    } else if (sample.format === 'properties') {
      const { result, error: propErr } = propertiesToJson(sample.content, preferences.indent);
      resultText = result;
      if (propErr) {
        validState = false;
        errDetail = { message: `Properties Parse Error: ${propErr}` };
      } else {
        const val = validateJson(resultText);
        validState = val.valid;
        errDetail = val.error;
        parsedObj = val.parsed;
      }
      setActiveActionTitle('Properties ➔ JSON');
    } else if (sample.format === 'urlencoded') {
      const { result } = urlEncodedToJson(sample.content, preferences.indent);
      resultText = result;
      const val = validateJson(resultText);
      validState = val.valid;
      errDetail = val.error;
      parsedObj = val.parsed;
      setActiveActionTitle('URL Query ➔ JSON');
    } else if (sample.format === 'csv') {
      parsedObj = csvToJson(sample.content, preferences.csvOptions);
      const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
      resultText = JSON.stringify(parsedObj, null, indentSpace);
      setActiveActionTitle('CSV ➔ JSON');
    } else if (sample.format === 'xml') {
      parsedObj = xmlToJson(sample.content);
      const indentSpace = preferences.indent === 'tab' ? '\t' : Number(preferences.indent) || 2;
      resultText = JSON.stringify(parsedObj, null, indentSpace);
      setActiveActionTitle('XML ➔ JSON');
    } else {
      const { result } = formatJson(sample.content, preferences.indent);
      resultText = result;
      const val = validateJson(resultText);
      validState = val.valid;
      errDetail = val.error;
      parsedObj = val.parsed;
      setActiveActionTitle('Formatted JSON');
    }

    setOutputText(resultText);
    setOutputLanguage('json');
    setParsedData(parsedObj);
    setIsValid(validState);
    setError(errDetail);
    setLastProcessedInput(sample.content);

    showToast(`Loaded sample: ${sample.name}`);
  };

  // Select item from history drawer
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.inputText);
    setOutputText(item.outputText);
    const restoredInputFormat = (getFormatAdapter(item.inputFormat)?.id || 'json') as DataFormat;
    setInputFormat(restoredInputFormat);
    setOutputLanguage(getOutputLanguage(item.outputFormat));
    setActiveActionTitle(item.title);

    const inputResult = getFormatAdapter(restoredInputFormat)?.parse(item.inputText);
    const outputResult = getFormatAdapter(item.outputFormat)?.parse(item.outputText);
    const restoredData = outputResult?.valid ? outputResult.data : inputResult?.valid ? inputResult.data : null;
    setParsedData(restoredData);
    setIsValid(Boolean(inputResult?.valid));
    setError(inputResult?.valid ? null : { message: inputResult?.error || 'Unable to parse restored input' });
    setLastProcessedInput(item.inputText);
    showToast(`Restored: ${item.title}`);
  };

  const loadJsonIntoEditor = (jsonText: string, message: string) => {
    const validation = validateJson(jsonText);
    setInputText(jsonText);
    setOutputText(jsonText);
    setInputFormat('json');
    setOutputLanguage('json');
    setParsedData(validation.parsed);
    setIsValid(validation.valid);
    setError(validation.error);
    setActiveActionTitle('Formatted JSON');
    setLastProcessedInput(jsonText);
    showToast(message);
  };

  const handleClearWorkspace = () => {
    setInputText('');
    setOutputText('');
    setParsedData(null);
    setSearchQuery('');
    setIsValid(true);
    setError(null);
    setActiveActionTitle('No output yet');
    setLastProcessedInput('');
    textareaRef.current?.focus();
    showToast('Workspace cleared');
  };

  const isOutputStale = Boolean(outputText) && inputText !== lastProcessedInput;

  // Stats calculation
  const stats: TransformationStats | null = React.useMemo(() => {
    return calculateStats(parsedData, inputText, outputText);
  }, [parsedData, inputText, outputText]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-indigo-500/30">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[110] max-w-[calc(100vw-2rem)] bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-3.5 py-2.5 rounded-xl shadow-xl font-mono text-xs flex items-center gap-2 border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <ClipboardCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        language={currentLanguage}
        onLanguageChange={(newLang) => {
          const updated = { ...preferences, language: newLang };
          setPreferences(updated);
          saveUserPreferences(updated);
          showToast(`Language: ${newLang.toUpperCase()}`);
        }}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        version={APP_VERSION}
        isOffline={isOffline}
        onSelectSample={handleSelectSample}
        showInstallButton={showInstallButton}
        onInstallClick={handleInstallClick}
        onOpenSqlStudio={() => setIsSqlModalOpen(true)}
        onOpenDiff={() => setIsDiffModalOpen(true)}
        onOpenTransformTools={() => setIsTransformToolsOpen(true)}
        onOpenCodeGenerator={() => setIsCodeGeneratorOpen(true)}
        onOpenJq={() => setIsJqModalOpen(true)}
        onOpenPatch={() => setIsPatchModalOpen(true)}
        onOpenApiSpec={() => setIsApiSpecOpen(true)}
        onOpenJwt={() => setIsJwtModalOpen(true)}
        onOpenObjectGraph={() => setIsObjectGraphOpen(true)}
        onOpenProfiler={() => setIsProfilerOpen(true)}
        onOpenBatch={() => setIsBatchModalOpen(true)}
        onOpenUrlFetcher={() => setIsUrlFetcherOpen(true)}
        onOpenCharts={() => setIsChartsOpen(true)}
        onOpenLlmSpec={() => setIsLlmSpecOpen(true)}
        onOpenMatrixModal={() => setIsMatrixModalOpen(true)}
        onRunFormat={(action) => handleFormat(action as any)}
        onRunCrossConversion={(from, to) => runCrossConversion(from, to)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-5 gap-3 overflow-visible">
        {/* Action Toolbar */}
        <section
          aria-label="Quick actions"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2 relative z-30"
        >
          {/* Format / Transformation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleFormat('format')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.formatJson}
            </button>

            <button
              onClick={() => handleFormat('minify')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-zinc-500" />
              {t.minifyJson}
            </button>

            <button
              onClick={() => handleFormat('repair')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium text-xs border border-amber-500/20 transition-colors cursor-pointer"
              title="Fix unquoted keys, single quotes, trailing commas"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              {t.repairJson}
            </button>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

            {/* Core Converters */}
            <button
              onClick={() => handleFormat('to-csv')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              JSON ➔ CSV
            </button>

            <button
              onClick={() => handleFormat('to-xml')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              JSON ➔ XML
            </button>

            <button
              onClick={() => handleFormat('to-yaml')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-teal-500" />
              JSON ➔ YAML
            </button>

            <button
              onClick={() => handleFormat('to-sql')}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              JSON ➔ SQL
            </button>

            {inputFormat === 'sql' && (
              <button
                onClick={() => handleFormat('sql-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                SQL ➔ JSON
              </button>
            )}

            {inputFormat === 'csv' && (
              <button
                onClick={() => handleFormat('csv-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                CSV ➔ JSON
              </button>
            )}

            {inputFormat === 'xml' && (
              <button
                onClick={() => handleFormat('xml-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                XML ➔ JSON
              </button>
            )}

            {inputFormat === 'toml' && (
              <button
                onClick={() => handleFormat('toml-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                TOML ➔ JSON
              </button>
            )}

            {inputFormat === 'properties' && (
              <button
                onClick={() => handleFormat('properties-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                .env ➔ JSON
              </button>
            )}

            {inputFormat === 'urlencoded' && (
              <button
                onClick={() => handleFormat('urlencoded-to-json')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
                URL Query ➔ JSON
              </button>
            )}

            {/* Auto-detected Visual Analytics & Chart Option */}
            {isChartableData(parsedData || inputText) && (
              <button
                onClick={() => setIsChartsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                title="Data contains numeric metrics eligible for interactive charting"
              >
                <BarChart3 className="w-4 h-4 text-amber-300" />
                <span>Visual Analytics & Chart</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/20 text-white font-extrabold uppercase">
                  AUTO
                </span>
              </button>
            )}

            {/* More Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800/60 transition-colors cursor-pointer"
                title="More JSON Utilities & Tools"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>{t.moreTools}</span>
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              </button>

              {showMoreTools && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreTools(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl z-50 p-2 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-sans max-h-[70vh] overflow-y-auto">
                    {/* Developer Tools & Studios */}
                    <div className="pb-2">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                        Developer Tools & Studios
                      </div>
                      <button
                        onClick={() => {
                          setIsSqlModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                        SQL Studio & Generator
                      </button>
                      <button
                        onClick={() => {
                          setIsDiffModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <GitCompare className="w-3.5 h-3.5 text-emerald-500" />
                        JSON Side-by-Side Diff
                      </button>
                      <button
                        onClick={() => {
                          setIsTransformToolsOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-violet-500" />
                        Case / PII Mask / JSONPath
                      </button>
                      <button
                        onClick={() => {
                          setIsCodeGeneratorOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5 text-blue-500" />
                        Multi-Lang Model Generator
                      </button>
                      <button
                        onClick={() => {
                          setIsJqModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Terminal className="w-3.5 h-3.5 text-teal-500" />
                        jq Syntax Query Playground
                      </button>
                      <button
                        onClick={() => {
                          setIsPatchModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileDiff className="w-3.5 h-3.5 text-cyan-500" />
                        JSON Patch & Merge Patch
                      </button>
                      <button
                        onClick={() => {
                          setIsApiSpecOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-orange-500" />
                        OpenAPI / cURL / GraphQL Specs
                      </button>
                      <button
                        onClick={() => {
                          setIsJwtModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        JWT Inspector & Claims Decoder
                      </button>
                      <button
                        onClick={() => {
                          setIsObjectGraphOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Network className="w-3.5 h-3.5 text-purple-500" />
                        Interactive ER & Object Graph
                      </button>
                      <button
                        onClick={() => {
                          setIsProfilerOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                        Payload Profiler & Stats Inspector
                      </button>
                      <button
                        onClick={() => {
                          setIsBatchModalOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
                        Multi-file Batch Processor
                      </button>
                      <button
                        onClick={() => {
                          setIsUrlFetcherOpen(true);
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-sky-500" />
                        URL & API Endpoint Fetcher
                      </button>
                    </div>

                    {/* Exporters & Code Converters */}
                    <div className="py-1.5">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Code & Data Exporters
                      </div>
                      <button
                        onClick={() => {
                          runCrossConversion('json', 'markdown');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-indigo-500" />
                        JSON ➔ Markdown Table
                      </button>
                      <button
                        onClick={() => {
                          runCrossConversion('json', 'ndjson');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        JSON ➔ NDJSON / JSON Lines
                      </button>
                      <button
                        onClick={() => {
                          runCrossConversion('json', 'python');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-yellow-500" />
                        JSON ➔ Python Dict
                      </button>
                      <button
                        onClick={() => {
                          runCrossConversion('json', 'php');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-purple-500" />
                        JSON ➔ PHP Array
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('to-html');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-emerald-500" />
                        JSON ➔ HTML Table
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('to-ts-interface');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Code className="w-3.5 h-3.5 text-blue-500" />
                        JSON ➔ TypeScript Interfaces
                      </button>
                    </div>

                    {/* Config & Web Formats */}
                    <div className="py-1.5">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Config & Web Formats
                      </div>
                      <button
                        onClick={() => {
                          handleFormat('to-toml');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-rose-500" />
                        JSON ➔ TOML
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('to-urlencoded');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-cyan-500" />
                        JSON ➔ URL Query String
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('to-properties');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-500" />
                        JSON ➔ .properties / .env
                      </button>
                    </div>

                    {/* Key Sorting & Cleaning */}
                    <div className="py-1.5">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Keys & Cleaning
                      </div>
                      <button
                        onClick={() => {
                          handleFormat('sort-asc');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
                        Sort Keys (A ➔ Z)
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('sort-desc');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500 rotate-180" />
                        Sort Keys (Z ➔ A)
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('clean');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Eraser className="w-3.5 h-3.5 text-rose-500" />
                        Remove Nulls & Empty Values
                      </button>
                    </div>

                    {/* Escaping & Encoding */}
                    <div className="py-1.5">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Strings & Encoding
                      </div>
                      <button
                        onClick={() => {
                          handleFormat('escape');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Quote className="w-3.5 h-3.5 text-amber-500" />
                        Escape JSON String
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('unescape');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Quote className="w-3.5 h-3.5 text-emerald-500" />
                        Unescape String
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('b64-encode');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Binary className="w-3.5 h-3.5 text-sky-500" />
                        Base64 Encode
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('b64-decode');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Binary className="w-3.5 h-3.5 text-violet-500" />
                        Base64 Decode
                      </button>
                    </div>

                    {/* Flatten & Schema */}
                    <div className="pt-1.5">
                      <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                        Structure & Schema
                      </div>
                      <button
                        onClick={() => {
                          handleFormat('flatten');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        Flatten Keys (Dot Notation)
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('unflatten');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-500" />
                        Unflatten Dot Notation
                      </button>
                      <button
                        onClick={() => {
                          handleFormat('to-schema');
                          setShowMoreTools(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/70 text-zinc-700 dark:text-zinc-200 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-blue-500" />
                        Generate JSON Schema
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Output View Mode Controls */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-md border border-zinc-200 dark:border-zinc-700/80">
            <button
              onClick={() => setOutputViewMode('code')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                outputViewMode === 'code'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              {t.codeView}
            </button>

            {parsedData && (
              <>
                <button
                  onClick={() => setOutputViewMode('tree')}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    outputViewMode === 'tree'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  {t.treeView}
                </button>

                <button
                  onClick={() => setOutputViewMode('table')}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    outputViewMode === 'table'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  {t.tableView}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Universal Cross-Format Converter Bar */}
        <section
          aria-label="Universal format converter"
          className="bg-zinc-900 text-white dark:bg-zinc-800/90 rounded-xl p-3 sm:px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 border border-zinc-800 dark:border-zinc-700/80"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="block text-xs font-semibold tracking-wide text-zinc-100">
                {t.universalConverter}
              </span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">Choose formats, then convert locally</span>
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2 text-xs">
            {/* Source Format */}
            <div className="flex min-w-0 flex-1 sm:flex-none items-center gap-1.5 bg-zinc-800 dark:bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5">
              <span className="text-zinc-400 font-mono text-[11px]">{t.from}:</span>
              <select
                aria-label="Source format"
                value={inputFormat}
                onChange={(e) => {
                  const newFmt = e.target.value as DataFormat;
                  setInputFormat(newFmt);
                  validateInputByFormat(inputText, newFmt);
                  runCrossConversion(newFmt, targetOutputFormat);
                }}
                className="min-w-0 w-full sm:w-44 bg-transparent text-white font-mono text-xs font-medium cursor-pointer focus:outline-none"
              >
                {READABLE_FORMATS.map((format) => (
                  <option key={format.id} value={format.id} className="bg-zinc-800 text-white">
                    {format.name}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-indigo-400 shrink-0" />

            {/* Target Format */}
            <div className="flex min-w-0 flex-1 sm:flex-none items-center gap-1.5 bg-zinc-800 dark:bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5">
              <span className="text-zinc-400 font-mono text-[11px]">{t.to}:</span>
              <select
                aria-label="Target format"
                value={targetOutputFormat}
                onChange={(e) => {
                  const newFmt = e.target.value as DataFormat;
                  setTargetOutputFormat(newFmt);
                  runCrossConversion(inputFormat, newFmt);
                }}
                className="min-w-0 w-full sm:w-48 bg-transparent text-white font-mono text-xs font-semibold cursor-pointer focus:outline-none"
              >
                {WRITABLE_FORMATS.map((format) => (
                  <option key={format.id} value={format.id} className="bg-zinc-800 text-white">
                    {format.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Execute Convert Button */}
            <button
              onClick={() => runCrossConversion(inputFormat, targetOutputFormat)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Convert</span>
            </button>
          </div>
        </section>

        {/* Dual Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:h-[calc(100vh-15.5rem)] lg:min-h-[520px] lg:max-h-[760px]">
          {/* Left Pane: Input Editor */}
          <div
            role="region"
            aria-labelledby="input-panel-title"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative h-[520px] sm:h-[620px] lg:h-full min-h-0 flex flex-col bg-white dark:bg-zinc-900 border rounded-xl overflow-hidden shadow-xs transition-all ${
              isDragging
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-950/20'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {/* Input Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-sans">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span id="input-panel-title" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="mr-1 text-indigo-600 dark:text-indigo-300">1.</span>Input
                </span>
                <select
                  value={inputFormat}
                  onChange={(e) => {
                    const newFmt = e.target.value as DataFormat;
                    setInputFormat(newFmt);
                    validateInputByFormat(inputText, newFmt);
                  }}
                  aria-label="Input format"
                  className="min-w-0 max-w-48 flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-zinc-800 dark:text-zinc-200 font-mono text-[11px] font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {READABLE_FORMATS.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const nextState = !autoDetectFormat;
                    setAutoDetectFormat(nextState);
                    if (nextState && inputText.trim()) {
                      const detected = detectFormat(inputText);
                      setInputFormat(detected);
                      validateInputByFormat(inputText, detected);
                      showToast(`Detected format: ${detected.toUpperCase()}`);
                    } else {
                      showToast(nextState ? 'Auto-detect enabled' : 'Auto-detect disabled');
                    }
                  }}
                  aria-pressed={autoDetectFormat}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                    autoDetectFormat
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  }`}
                  title="Automatically detect the input format"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="hidden min-[460px]:inline">Auto-detect {autoDetectFormat ? 'on' : 'off'}</span>
                </button>
              </div>

              {/* Input Action Buttons */}
              <div className="flex items-center gap-1 ml-auto">
                <label className="inline-flex items-center gap-1 px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded cursor-pointer transition-colors text-[11px] font-medium">
                  <Upload className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept=".json,.xml,.csv,.yaml,.yml,.toml,.txt,.properties,.env"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        if (preferences.autoRepairOnPaste && inputFormat === 'json') {
                          const { repaired, fixed } = repairJson(text);
                          if (fixed) {
                            handleInputChange(repaired);
                            showToast('Pasted & auto-repaired JSON syntax!');
                            return;
                          }
                        }
                        handleInputChange(text);
                      }
                    } catch {
                      showToast('Clipboard access denied');
                    }
                  }}
                  className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-[11px] font-medium cursor-pointer"
                  title="Paste from clipboard"
                >
                  Paste
                </button>

                <button
                  onClick={handleSwapOutputToInput}
                  className="inline-flex items-center gap-1 px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors text-[11px] font-medium cursor-pointer"
                  title="Swap output back into input editor (Ctrl+Shift+X)"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Swap</span>
                </button>

                <button
                  onClick={handleClearWorkspace}
                  className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                  title="Clear workspace"
                  aria-label="Clear workspace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error Banner overlay if invalid JSON */}
            {!isValid && error && (
              <div className="bg-rose-500/10 border-b border-rose-500/20 px-3 py-1.5 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-mono">
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="font-medium truncate">{error.message}</span>
                </div>
                {(inputFormat === 'json' || inputFormat === 'json5') && (
                  <button
                    onClick={() => handleFormat('repair')}
                    className="shrink-0 px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-sans font-medium rounded text-[11px] transition-colors cursor-pointer"
                  >
                    Auto Repair
                  </button>
                )}
              </div>
            )}

            {/* Input Line-Numbered Textarea Area */}
            <div className="flex-1 relative overflow-hidden flex bg-white dark:bg-zinc-900 font-mono text-xs sm:text-sm">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="select-none w-11 shrink-0 overflow-hidden border-r border-zinc-200 bg-zinc-50 py-3 pl-2 pr-2 text-right text-[11px] leading-relaxed text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400"
              >
                {Array.from({ length: Math.max(1, inputLinesCount) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Textarea */}
              <textarea
                ref={textareaRef}
                onScroll={handleInputScroll}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onPaste={(e) => {
                  if (preferences.autoRepairOnPaste && inputFormat === 'json') {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted) {
                      const { repaired, fixed } = repairJson(pasted);
                      if (fixed) {
                        e.preventDefault();
                        handleInputChange(repaired);
                        showToast('Auto-repaired pasted JSON syntax!');
                      }
                    }
                  } else if (preferences.autoFormatOnPaste && inputFormat === 'json') {
                    const pasted = e.clipboardData.getData('text');
                    if (pasted) {
                      const { result, error: fmtErr } = formatJson(pasted, preferences.indent);
                      if (!fmtErr) {
                        e.preventDefault();
                        handleInputChange(result);
                        showToast('Auto-formatted pasted JSON!');
                      }
                    }
                  }
                }}
                placeholder="Paste or type your JSON, XML, CSV, TOML, or .env data here..."
                className="w-full h-full p-3 font-mono text-xs sm:text-sm bg-transparent text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/20 whitespace-pre overflow-auto"
                spellCheck={false}
              />

              {/* Empty State Quick-Start Overlay */}
              {!inputText.trim() && (
                <div className="absolute inset-0 z-10 p-6 flex flex-col items-center justify-center text-center bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-2xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 m-3 rounded-xl select-none transition-all">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-3">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Ready to Format, Validate & Convert
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1 mb-4">
                    Paste your JSON, XML, CSV, TOML, or .env data, drag & drop a file, or click a quick sample below.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md">
                    <button
                      onClick={() => handleSelectSample(SAMPLE_DATASETS[0])}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors cursor-pointer"
                    >
                      🚀 User Profiles
                    </button>
                    <button
                      onClick={() => handleSelectSample(SAMPLE_DATASETS[1])}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors cursor-pointer"
                    >
                      🛒 E-Commerce
                    </button>
                    <button
                      onClick={() => handleSelectSample(SAMPLE_DATASETS[3])}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors cursor-pointer"
                    >
                      🔧 Dirty JSON (Repair)
                    </button>
                    <button
                      onClick={() => handleSelectSample(SAMPLE_DATASETS[13])}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors cursor-pointer"
                    >
                      🔑 JWT Token
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            handleInputChange(text);
                            showToast('Pasted from clipboard!');
                          }
                        } catch {
                          showToast('Clipboard access denied');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      📋 Paste Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Output Viewer */}
          <div
            role="region"
            aria-labelledby="output-panel-title"
            className="h-[520px] sm:h-[620px] lg:h-full min-h-0 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs"
          >
            {/* Output Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-sans">
              <div className="flex items-center gap-2">
                <span id="output-panel-title" className="font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="mr-1 text-indigo-600 dark:text-indigo-300">2.</span>Output
                </span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">
                  {activeActionTitle}
                </span>
                {isOutputStale && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[10px]">
                    <RefreshCw className="w-3 h-3" />
                    Input changed
                  </span>
                )}
              </div>

              {/* Filter search box in code output */}
              {outputViewMode === 'code' && (
                <div className="relative max-w-[170px] sm:max-w-xs flex items-center">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-14 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery.trim() && (
                    <span className="absolute right-2 text-[10px] font-mono font-semibold px-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 pointer-events-none">
                      {searchMatchesCount} match{searchMatchesCount === 1 ? '' : 'es'}
                    </span>
                  )}
                </div>
              )}

              {/* Output Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyOutput}
                  disabled={!outputText}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 disabled:opacity-50 font-medium rounded text-[11px] transition-colors cursor-pointer"
                  title="Copy output to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!outputText}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 disabled:opacity-50 font-medium rounded text-[11px] border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  title="Download output file"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Output Display Body */}
            <div className="flex-1 min-h-0 overflow-auto p-1 relative">
              {!outputText && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Output will appear here</h3>
                  <p className="mt-1 text-xs max-w-xs">
                    Add data to the input editor, then format it or choose a target format above.
                  </p>
                </div>
              )}

              {outputText && outputViewMode === 'code' && (
                <SyntaxHighlighter
                  code={outputText}
                  language={outputLanguage}
                  errorLine={error?.line}
                  searchQuery={searchQuery}
                />
              )}

              {outputText && outputViewMode === 'tree' && (
                <TreeView
                  data={parsedData}
                  searchQuery={searchQuery}
                />
              )}

              {outputText && outputViewMode === 'table' && (
                <TableView
                  data={parsedData}
                  searchQuery={searchQuery}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer Statistics Bar */}
        <StatsBar
          isValid={isValid}
          error={error}
          stats={stats}
          activeAction={activeActionTitle}
          language={currentLanguage}
        />
      </main>

      {/* SEO Footer Section */}
      <footer className="mt-4 sm:mt-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 py-6 sm:py-10 px-4 sm:px-8 text-zinc-600 dark:text-zinc-400 text-xs font-sans">
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8">
          {/* Main Footer Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-base">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span>JSON Studio Pro — Universal Multi-Format Data Converter</span>
              </div>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400 text-xs">
                Official web app hosted at <a href={HOMEPAGE_URL} className="text-indigo-600 dark:text-indigo-400 font-mono hover:underline font-semibold">{HOMEPAGE_DOMAIN}</a> — Ultra-fast, private client-side format transformation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t.privacyGuaranteed}
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> {t.fastConversion}
              </span>
            </div>
          </div>

          {/* Formats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-xs">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-2 font-mono uppercase tracking-wider text-[11px] text-indigo-500">
                {t.coreFormats}
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• {t.fmtJsonRepair}</li>
                <li>• {t.fmtXmlSchema}</li>
                <li>• {t.fmtCsvTsv}</li>
                <li>• {t.fmtYamlConfig}</li>
                <li>• {t.fmtTomlConfig}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-2 font-mono uppercase tracking-wider text-[11px] text-indigo-500">
                {t.codeWeb}
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• {t.cwTsInterfaces}</li>
                <li>• {t.cwSqlInserts}</li>
                <li>• {t.cwHtmlMdTables}</li>
                <li>• {t.cwPythonDict}</li>
                <li>• {t.cwPhpArray}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-2 font-mono uppercase tracking-wider text-[11px] text-indigo-500">
                {t.streamsConfig}
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• {t.scNdjson}</li>
                <li>• {t.scEnvProperties}</li>
                <li>• {t.scUrlQuery}</li>
                <li>• {t.scBase64Escaped}</li>
                <li>• {t.scJsonSchema}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 mb-2 font-mono uppercase tracking-wider text-[11px] text-indigo-500">
                {t.keyFeatures}
              </h4>
              <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>• {t.kfAutoRepair}</li>
                <li>• {t.kfKeySorting}</li>
                <li>• {t.kfSearchFilter}</li>
                <li>• {t.kfTreeTableViews}</li>
                <li>• {t.kfOfflineHistory}</li>
              </ul>
            </div>
          </div>

          {/* Developer FAQs for SEO & Search Crawlers */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              {t.faqTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t.faq1Q}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.faq1A}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t.faq2Q}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.faq2A}
                </p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                  {t.faq3Q}
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {t.faq3A}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-[11px] text-zinc-500 md:flex-row dark:border-zinc-800 dark:text-zinc-400">
            <div className="flex flex-wrap items-center gap-2">
              <span>© {new Date().getFullYear()} <a href={HOMEPAGE_URL} className="hover:underline font-mono font-medium text-zinc-700 dark:text-zinc-300">{HOMEPAGE_DOMAIN}</a>. {t.allRightsReserved}</span>
              
              {/* Open Source Project Badge */}
              <a
                href="https://github.com/jomardyan/JSON-STUDIO"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="100% Free & Open Source Project (MIT License)"
              >
                <Github className="w-3 h-3 text-zinc-800 dark:text-zinc-200" />
                <span>{t.openSource}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </a>

              {/* Client-Side Privacy Badge */}
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {t.clientSidePrivacy}
              </span>

              {/* Version Badge */}
              <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {APP_VERSION}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <a href="https://github.com/jomardyan/JSON-STUDIO" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <Github className="w-3 h-3" />
                <span>GitHub Repository</span>
              </a>
              <span>•</span>
              <a href="https://github.com/jomardyan/JSON-STUDIO/issues/new" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Report Issue / Request Feature</span>
              </a>
              <span>•</span>
              <button onClick={() => setIsSettingsOpen(true)} className="hover:underline cursor-pointer">{t.settings}</button>
              <span>•</span>
              <button onClick={() => setIsHistoryOpen(true)} className="hover:underline cursor-pointer">{t.history}</button>
              <span>•</span>
              <button onClick={() => setIsChangelogOpen(true)} className="hover:underline font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center gap-1">
                <span>{t.changelog}</span>
                <span className="text-[10px] font-mono font-bold">({APP_VERSION})</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        language={currentLanguage}
        historyItems={historyItems}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={(id) => setHistoryItems(deleteHistoryItem(id))}
        onClearHistory={() => {
          clearHistoryStorage();
          setHistoryItems([]);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={(newPrefs) => {
          setPreferences(newPrefs);
          saveUserPreferences(newPrefs);
          showToast('Saved conversion preferences');
        }}
      />

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        language={currentLanguage}
        currentVersion={APP_VERSION}
      />

      {/* Dedicated SQL Studio Modal */}
      <SqlConverterModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        inputText={inputText}
        onApplyResult={(resultText, format) => {
          setOutputText(resultText);
          setOutputLanguage(format === 'sql' ? 'text' : 'json');
          setOutputViewMode('code');
          setActiveActionTitle(format === 'sql' ? 'SQL Script & Schema' : 'Parsed SQL to JSON');
          setLastProcessedInput(inputText);
          showToast(`Generated ${format.toUpperCase()}`);
        }}
        sqlOptions={preferences.sqlOptions}
        onUpdateSqlOptions={(newSqlOpts) => {
          const updated = { ...preferences, sqlOptions: newSqlOpts };
          setPreferences(updated);
          saveUserPreferences(updated);
        }}
        language={currentLanguage}
      />

      {/* JSON Diff & Comparator Modal */}
      <JsonDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        initialLeftText={inputText}
        language={currentLanguage}
      />

      {/* Advanced Transform Tools Modal */}
      <JsonTransformToolsModal
        isOpen={isTransformToolsOpen}
        onClose={() => setIsTransformToolsOpen(false)}
        inputText={inputText}
        onApplyResult={(resultText, actionName) => {
          loadJsonIntoEditor(resultText, `Applied ${actionName}`);
        }}
        language={currentLanguage}
      />

      {/* Multi-Language Code Generator Modal */}
      <CodeGeneratorModal
        isOpen={isCodeGeneratorOpen}
        onClose={() => setIsCodeGeneratorOpen(false)}
        inputText={inputText}
        language={currentLanguage}
      />

      {/* jq Syntax Query Playground Modal */}
      <JqQueryModal
        isOpen={isJqModalOpen}
        onClose={() => setIsJqModalOpen(false)}
        inputText={inputText}
        onApplyResult={(resultText, queryStr) => {
          loadJsonIntoEditor(resultText, `Applied jq filter (${queryStr})`);
        }}
        language={currentLanguage}
      />

      {/* JSON Patch & Merge Patch Modal */}
      <JsonPatchModal
        isOpen={isPatchModalOpen}
        onClose={() => setIsPatchModalOpen(false)}
        inputText={inputText}
        onApplyResult={(resultText, actionName) => {
          loadJsonIntoEditor(resultText, actionName);
        }}
        language={currentLanguage}
      />

      {/* API & Specification Generators Modal (OpenAPI, cURL, GraphQL) */}
      <ApiSpecModal
        isOpen={isApiSpecOpen}
        onClose={() => setIsApiSpecOpen(false)}
        inputText={inputText}
        onApplyJsonToEditor={(extractedJson) => {
          loadJsonIntoEditor(extractedJson, 'Extracted JSON payload to main editor');
        }}
        language={currentLanguage}
      />

      {/* JWT Inspector & Decoder Modal */}
      <JwtDecoderModal
        isOpen={isJwtModalOpen}
        onClose={() => setIsJwtModalOpen(false)}
        inputText={inputText}
        onApplyPayloadToEditor={(payloadJson) => {
          loadJsonIntoEditor(payloadJson, 'Loaded JWT payload into main editor');
        }}
        language={currentLanguage}
      />

      {/* Interactive ER & Object Graph Visualizer Modal */}
      <ObjectGraphModal
        isOpen={isObjectGraphOpen}
        onClose={() => setIsObjectGraphOpen(false)}
        inputText={inputText}
        language={currentLanguage}
      />

      {/* Payload Profiler & Stats Inspector Modal */}
      <PayloadProfilerModal
        isOpen={isProfilerOpen}
        onClose={() => setIsProfilerOpen(false)}
        inputText={inputText}
        language={currentLanguage}
      />

      {/* Multi-File Drag & Drop Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onApplySingleToEditor={(convertedContent, format) => {
          const restoredFormat = (getFormatAdapter(format)?.id || 'json') as DataFormat;
          const parsed = getFormatAdapter(restoredFormat)?.parse(convertedContent);
          setInputText(convertedContent);
          setOutputText(convertedContent);
          setInputFormat(restoredFormat);
          setOutputLanguage(getOutputLanguage(restoredFormat));
          setParsedData(parsed?.valid ? parsed.data : null);
          setIsValid(Boolean(parsed?.valid));
          setError(parsed?.valid ? null : { message: parsed?.error || `Invalid ${format} output` });
          setActiveActionTitle(`Batch ${getFormatAdapter(restoredFormat)?.name || restoredFormat}`);
          setLastProcessedInput(convertedContent);
          showToast('Loaded batch output into main editor');
        }}
        language={currentLanguage}
      />

      {/* URL & API Endpoint Fetcher Modal */}
      <UrlFetcherModal
        isOpen={isUrlFetcherOpen}
        onClose={() => setIsUrlFetcherOpen(false)}
        onApplyJsonToEditor={(fetchedJson) => {
          loadJsonIntoEditor(fetchedJson, 'Loaded fetched API JSON into main editor');
        }}
        language={currentLanguage}
      />

      {/* Visual Analytics & Charts Modal */}
      <JsonChartsModal
        isOpen={isChartsOpen}
        onClose={() => setIsChartsOpen(false)}
        jsonData={parsedData || inputText}
      />

      {/* AI & LLM Structured Spec Generator Modal */}
      <LlmToolGeneratorModal
        isOpen={isLlmSpecOpen}
        onClose={() => setIsLlmSpecOpen(false)}
        jsonData={parsedData || inputText}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Spotlight Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRunFormat={(action) => handleFormat(action as any)}
        onRunCrossConversion={(from, to) => runCrossConversion(from as any, to as any)}
        onOpenModal={(modalName) => {
          if (modalName === 'sql') setIsSqlModalOpen(true);
          else if (modalName === 'diff') setIsDiffModalOpen(true);
          else if (modalName === 'transform') setIsTransformToolsOpen(true);
          else if (modalName === 'code') setIsCodeGeneratorOpen(true);
          else if (modalName === 'jq') setIsJqModalOpen(true);
          else if (modalName === 'patch') setIsPatchModalOpen(true);
          else if (modalName === 'api') setIsApiSpecOpen(true);
          else if (modalName === 'jwt') setIsJwtModalOpen(true);
          else if (modalName === 'graph') setIsObjectGraphOpen(true);
          else if (modalName === 'profiler') setIsProfilerOpen(true);
          else if (modalName === 'batch') setIsBatchModalOpen(true);
          else if (modalName === 'url') setIsUrlFetcherOpen(true);
          else if (modalName === 'charts') setIsChartsOpen(true);
          else if (modalName === 'llm') setIsLlmSpecOpen(true);
          else if (modalName === 'matrix') setIsMatrixModalOpen(true);
          else if (modalName === 'history') setIsHistoryOpen(true);
          else if (modalName === 'settings') setIsSettingsOpen(true);
          else if (modalName === 'shortcuts') setIsShortcutsOpen(true);
        }}
        onSelectSample={handleSelectSample}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Conversion Compatibility Matrix Modal */}
      <ConversionMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        onSelectConversion={(from, to) => runCrossConversion(from as any, to as any)}
      />

      {/* EU Compliant Privacy Banner */}
      {showPrivacyBanner && (
        <aside
          aria-label="Privacy notice"
          className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:w-[min(680px,calc(100vw-2rem))] sm:-translate-x-1/2 z-[100] bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 px-4 py-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300 border border-zinc-200 dark:border-zinc-700 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3 min-w-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400 dark:text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm min-w-0">
              <p className="font-semibold mb-0.5">{t.privacyTitle}</p>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                {t.privacyText}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrivacyAccept}
            className="shrink-0 self-end sm:self-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.privacyAccept}
          </button>
        </aside>
      )}
    </div>
  );
}
