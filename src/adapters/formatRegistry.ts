import { formatCodecs } from './formatCodecs';

export interface ConversionError { message: string; line?: number; column?: number }
export interface ConversionWarning { message: string; code: string }
export interface ConversionResult {
  outputText: string;
  parsedObj?: unknown;
  sourceFormat: string;
  targetFormat: string;
  valid: boolean;
  errors: ConversionError[];
  warnings: ConversionWarning[];
  durationMs: number;
  isLossy: boolean;
  lossyDetails?: string[];
}
export interface FormatCapabilities {
  supportsNestedObjects: boolean;
  supportsArrays: boolean;
  supportsComments: boolean;
  supportsTypes: boolean;
}
export type AdapterSupport = 'full' | 'partial' | 'none';
export interface FormatAdapter {
  id: string;
  name: string;
  extensions: string[];
  mimeTypes: string[];
  capabilities: FormatCapabilities;
  readSupport: AdapterSupport;
  writeSupport: AdapterSupport;
  parse: (input: string) => { valid: boolean; data?: unknown; error?: string };
  serialize: (data: unknown, indent?: string | number) => string;
}
export type CompatibilityStatus = 'same' | 'supported' | 'partial' | 'lossy' | 'none';
export interface ConversionCompatibility { status: CompatibilityStatus; label: string; reasons: string[] }

type AdapterDefinition = Omit<FormatAdapter, 'parse' | 'serialize'>;
const caps = (
  supportsNestedObjects: boolean,
  supportsArrays: boolean,
  supportsComments: boolean,
  supportsTypes: boolean
): FormatCapabilities => ({ supportsNestedObjects, supportsArrays, supportsComments, supportsTypes });

const definitions: AdapterDefinition[] = [
  { id: 'json', name: 'JSON', extensions: ['.json'], mimeTypes: ['application/json'], capabilities: caps(true, true, false, true), readSupport: 'full', writeSupport: 'full' },
  { id: 'csv', name: 'CSV Spreadsheet', extensions: ['.csv'], mimeTypes: ['text/csv'], capabilities: caps(false, true, false, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'xml', name: 'XML Document', extensions: ['.xml'], mimeTypes: ['application/xml', 'text/xml'], capabilities: caps(true, true, true, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'yaml', name: 'YAML Manifest', extensions: ['.yaml', '.yml'], mimeTypes: ['application/x-yaml', 'text/yaml'], capabilities: caps(true, true, true, true), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'toml', name: 'TOML Configuration', extensions: ['.toml'], mimeTypes: ['application/toml', 'text/x-toml'], capabilities: caps(true, true, true, true), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'sql', name: 'SQL Script', extensions: ['.sql'], mimeTypes: ['application/sql', 'text/x-sql'], capabilities: caps(false, true, true, true), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'markdown', name: 'Markdown Table', extensions: ['.md'], mimeTypes: ['text/markdown'], capabilities: caps(false, true, false, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'html', name: 'HTML Table', extensions: ['.html', '.htm'], mimeTypes: ['text/html'], capabilities: caps(false, true, true, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'ts-interface', name: 'TypeScript Interface', extensions: ['.ts'], mimeTypes: ['application/typescript'], capabilities: caps(true, true, true, true), readSupport: 'none', writeSupport: 'partial' },
  { id: 'python', name: 'Python Dict', extensions: ['.py'], mimeTypes: ['text/x-python'], capabilities: caps(true, true, true, true), readSupport: 'none', writeSupport: 'partial' },
  { id: 'php', name: 'PHP Array', extensions: ['.php'], mimeTypes: ['text/x-php'], capabilities: caps(true, true, true, true), readSupport: 'none', writeSupport: 'partial' },
  { id: 'ndjson', name: 'NDJSON / JSON Lines', extensions: ['.ndjson', '.jsonl'], mimeTypes: ['application/x-ndjson'], capabilities: caps(true, true, false, true), readSupport: 'full', writeSupport: 'full' },
  { id: 'properties', name: 'Java Properties', extensions: ['.properties'], mimeTypes: ['text/x-java-properties', 'text/plain'], capabilities: caps(false, false, true, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'ini', name: 'INI Configuration', extensions: ['.ini', '.cfg'], mimeTypes: ['text/plain'], capabilities: caps(true, false, true, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'hcl', name: 'HCL / Terraform', extensions: ['.hcl', '.tf'], mimeTypes: ['text/x-hcl', 'text/plain'], capabilities: caps(true, true, true, true), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'json5', name: 'JSON5 / JSONC', extensions: ['.json5', '.jsonc'], mimeTypes: ['application/json5', 'application/jsonc'], capabilities: caps(true, true, true, true), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'env', name: 'Dotenv Environment', extensions: ['.env'], mimeTypes: ['text/plain'], capabilities: caps(false, false, true, false), readSupport: 'partial', writeSupport: 'partial' },
  { id: 'urlencoded', name: 'URL Query Parameters', extensions: ['.txt'], mimeTypes: ['application/x-www-form-urlencoded'], capabilities: caps(false, true, false, false), readSupport: 'full', writeSupport: 'partial' },
];

const FORMAT_ADAPTERS = Object.fromEntries(
  definitions.map((definition) => {
    const codec = formatCodecs[definition.id];
    if (!codec) throw new Error(`Missing codec for ${definition.id}`);
    return [definition.id, { ...definition, ...codec } satisfies FormatAdapter];
  })
) as Record<string, FormatAdapter>;

const FORMAT_ALIASES: Record<string, string> = {
  typescript: 'ts-interface',
  ts: 'ts-interface',
  jsonc: 'json5',
  yml: 'yaml',
  dotenv: 'env',
  'url-encoded': 'urlencoded',
  querystring: 'urlencoded',
};

export function resolveFormatId(id: string): string {
  const normalized = id.trim().toLowerCase();
  return FORMAT_ALIASES[normalized] || normalized;
}
export function getFormatAdapter(id: string): FormatAdapter | null {
  return FORMAT_ADAPTERS[resolveFormatId(id)] || null;
}
export function listFormatAdapters(): FormatAdapter[] {
  return Object.values(FORMAT_ADAPTERS);
}
export function detectFormatFromFilename(filename: string): string | null {
  const normalized = filename.toLowerCase();
  return listFormatAdapters()
    .flatMap((adapter) => adapter.extensions.map((extension) => ({ adapter, extension })))
    .sort((left, right) => right.extension.length - left.extension.length)
    .find(({ extension }) => normalized.endsWith(extension))?.adapter.id || null;
}
export function getFileExtensionForFormat(formatOrTitle: string): string {
  const normalized = formatOrTitle.trim().toLowerCase();
  const exact = getFormatAdapter(normalized);
  if (exact) return exact.extensions[0] || '.txt';
  if (normalized.includes('schema')) return '.schema.json';
  if (normalized.includes('typescript')) return '.ts';
  const target = listFormatAdapters().find((adapter) =>
    normalized.endsWith(adapter.name.toLowerCase()) || normalized.includes(`to ${adapter.id}`) || normalized.includes(`➔ ${adapter.id}`)
  );
  return target?.extensions[0] || '.json';
}

function dataFeatures(data: unknown) {
  const features = { hasArrays: false, hasNestedObjects: false, hasTypedScalars: false };
  const visit = (value: unknown, depth: number) => {
    if (Array.isArray(value)) {
      features.hasArrays = true;
      value.forEach((item) => visit(item, depth + 1));
    } else if (value && typeof value === 'object') {
      if (depth > 0) features.hasNestedObjects = true;
      Object.values(value as Record<string, unknown>).forEach((item) => visit(item, depth + 1));
    } else if (value === null || typeof value === 'number' || typeof value === 'boolean') {
      features.hasTypedScalars = true;
    }
  };
  visit(data, 0);
  return features;
}

export function getConversionCompatibility(sourceFormat: string, targetFormat: string): ConversionCompatibility {
  const source = getFormatAdapter(sourceFormat);
  const target = getFormatAdapter(targetFormat);
  const reasons: string[] = [];
  if (!source || !target) return { status: 'none', label: 'Unavailable', reasons: ['Unknown format'] };
  if (source.id === target.id) return { status: 'same', label: 'Identical', reasons };
  if (source.readSupport === 'none') return { status: 'none', label: 'Output only', reasons: [`${source.name} cannot be parsed`] };
  if (target.writeSupport === 'none') return { status: 'none', label: 'Input only', reasons: [`${target.name} cannot be generated`] };
  if (!target.capabilities.supportsNestedObjects && source.capabilities.supportsNestedObjects) reasons.push('Nested objects may be flattened or stringified');
  if (!target.capabilities.supportsArrays && source.capabilities.supportsArrays) reasons.push('Arrays may be flattened or stringified');
  if (!target.capabilities.supportsTypes && source.capabilities.supportsTypes) reasons.push('Typed values may be converted to strings');
  if (reasons.length) return { status: 'lossy', label: 'Potential data loss', reasons };
  if (source.readSupport === 'partial' || target.writeSupport === 'partial') {
    return { status: 'partial', label: 'Partial support', reasons: ['Parser or serializer supports a documented subset'] };
  }
  return { status: 'supported', label: 'Supported', reasons };
}

export function convertFormat(
  input: string,
  sourceFormat: string,
  targetFormat: string,
  indent: string | number = 2
): ConversionResult {
  const startTime = performance.now();
  const sourceId = resolveFormatId(sourceFormat);
  const targetId = resolveFormatId(targetFormat);
  const source = getFormatAdapter(sourceId);
  const target = getFormatAdapter(targetId);
  const base = { outputText: input, sourceFormat: sourceId, targetFormat: targetId, durationMs: 0, isLossy: false };

  if (!source || !target) {
    return { ...base, valid: false, errors: [{ message: `Unsupported format: ${!source ? sourceFormat : targetFormat}` }], warnings: [], durationMs: performance.now() - startTime };
  }
  if (source.readSupport === 'none') {
    return { ...base, valid: false, errors: [{ message: `${source.name} is output-only and cannot be used as a source format` }], warnings: [], durationMs: performance.now() - startTime };
  }
  const parsed = source.parse(input);
  if (!parsed.valid) {
    return { ...base, valid: false, errors: [{ message: parsed.error || `Failed to parse ${source.name}` }], warnings: [], durationMs: performance.now() - startTime };
  }

  const warnings: ConversionWarning[] = [];
  if (source.readSupport === 'partial') warnings.push({ code: 'PARTIAL_SOURCE_SUPPORT', message: `${source.name} parsing supports a documented subset.` });
  if (target.writeSupport === 'partial') warnings.push({ code: 'PARTIAL_TARGET_SUPPORT', message: `${target.name} generation supports a documented subset.` });
  const features = dataFeatures(parsed.data);
  if (features.hasNestedObjects && !target.capabilities.supportsNestedObjects) warnings.push({ code: 'DATA_LOSS_NESTED_OBJECTS', message: `${target.name} cannot preserve nested objects without flattening or stringification.` });
  if (features.hasArrays && !target.capabilities.supportsArrays) warnings.push({ code: 'DATA_LOSS_ARRAYS', message: `${target.name} cannot preserve arrays without flattening or stringification.` });
  if (features.hasTypedScalars && !target.capabilities.supportsTypes) warnings.push({ code: 'DATA_LOSS_TYPES', message: `${target.name} does not preserve native scalar types.` });

  try {
    const outputText = target.serialize(parsed.data, indent);
    const lossyDetails = warnings.filter((warning) => warning.code.startsWith('DATA_LOSS_')).map((warning) => warning.message);
    return { outputText, parsedObj: parsed.data, sourceFormat: sourceId, targetFormat: targetId, valid: true, errors: [], warnings, durationMs: performance.now() - startTime, isLossy: lossyDetails.length > 0, lossyDetails };
  } catch (error: unknown) {
    return { ...base, parsedObj: parsed.data, valid: false, errors: [{ message: error instanceof Error ? error.message : 'Failed to serialize target format' }], warnings, durationMs: performance.now() - startTime };
  }
}
