import {
  jsonToCsv,
  jsonToXml,
  jsonToYaml,
  jsonToSql,
  jsonToToml,
  jsonToHtmlTable,
  jsonToMarkdownTable,
  jsonToTsInterface,
  jsonToNdjson,
  jsonToPythonDict,
  jsonToPhpArray,
  jsonToProperties,
  csvToJson,
  xmlToJson,
  tomlToJson,
  sqlToJson,
  propertiesToJson,
} from '../utils/jsonUtils';

export interface ConversionError {
  message: string;
  line?: number;
  column?: number;
}

export interface ConversionWarning {
  message: string;
  code: string;
}

export interface ConversionResult {
  outputText: string;
  parsedObj?: any;
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

export interface FormatAdapter {
  id: string;
  name: string;
  extensions: string[];
  mimeTypes: string[];
  capabilities: FormatCapabilities;
  parse: (input: string) => { valid: boolean; data?: any; error?: string };
  serialize: (data: any, indent?: string | number) => string;
}

// Registry Map
const FORMAT_ADAPTERS: Record<string, FormatAdapter> = {
  json: {
    id: 'json',
    name: 'JSON',
    extensions: ['.json', '.jsonc'],
    mimeTypes: ['application/json'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: false,
      supportsTypes: true,
    },
    parse: (input: string) => {
      try {
        const data = JSON.parse(input);
        return { valid: true, data };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any, indent: string | number = 2) => {
      const space = indent === 'tab' ? '\t' : Number(indent) || 2;
      return JSON.stringify(data, null, space);
    },
  },

  csv: {
    id: 'csv',
    name: 'CSV Spreadsheet',
    extensions: ['.csv'],
    mimeTypes: ['text/csv'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: true,
      supportsComments: false,
      supportsTypes: false,
    },
    parse: (input: string) => {
      try {
        const rows = csvToJson(input);
        return { valid: true, data: rows };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return jsonToCsv(parsed);
    },
  },

  xml: {
    id: 'xml',
    name: 'XML Document',
    extensions: ['.xml'],
    mimeTypes: ['application/xml', 'text/xml'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: false,
    },
    parse: (input: string) => {
      try {
        const obj = xmlToJson(input);
        return { valid: true, data: obj };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return jsonToXml(parsed);
    },
  },

  yaml: {
    id: 'yaml',
    name: 'YAML Manifest',
    extensions: ['.yaml', '.yml'],
    mimeTypes: ['application/x-yaml', 'text/yaml'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: (input: string) => {
      try {
        const data = JSON.parse(input);
        return { valid: true, data };
      } catch {
        const lines = input.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
        const obj: Record<string, any> = {};
        lines.forEach((l) => {
          const idx = l.indexOf(':');
          if (idx !== -1) {
            obj[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
          }
        });
        return { valid: true, data: obj };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToYaml(jsonStr).result;
    },
  },

  toml: {
    id: 'toml',
    name: 'TOML Configuration',
    extensions: ['.toml'],
    mimeTypes: ['application/toml', 'text/x-toml'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: (input: string) => {
      const { result, error } = tomlToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToToml(jsonStr).result;
    },
  },

  sql: {
    id: 'sql',
    name: 'SQL Script',
    extensions: ['.sql'],
    mimeTypes: ['application/sql', 'text/x-sql'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: (input: string) => {
      const { result, error } = sqlToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToSql(jsonStr).result;
    },
  },

  markdown: {
    id: 'markdown',
    name: 'Markdown Table',
    extensions: ['.md'],
    mimeTypes: ['text/markdown'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: true,
      supportsComments: false,
      supportsTypes: false,
    },
    parse: () => ({ valid: false, error: 'Markdown table parsing not supported' }),
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToMarkdownTable(jsonStr).result;
    },
  },

  html: {
    id: 'html',
    name: 'HTML Table',
    extensions: ['.html', '.htm'],
    mimeTypes: ['text/html'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: false,
    },
    parse: () => ({ valid: false, error: 'HTML table parsing not supported' }),
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToHtmlTable(jsonStr).result;
    },
  },

  typescript: {
    id: 'typescript',
    name: 'TypeScript Interface',
    extensions: ['.ts'],
    mimeTypes: ['application/typescript'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: () => ({ valid: false, error: 'TypeScript parsing not supported' }),
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToTsInterface(jsonStr).result;
    },
  },

  python: {
    id: 'python',
    name: 'Python Dict',
    extensions: ['.py'],
    mimeTypes: ['text/x-python'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: () => ({ valid: false, error: 'Python dict parsing not supported' }),
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToPythonDict(jsonStr).result;
    },
  },

  php: {
    id: 'php',
    name: 'PHP Array',
    extensions: ['.php'],
    mimeTypes: ['text/x-php'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: () => ({ valid: false, error: 'PHP array parsing not supported' }),
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToPhpArray(jsonStr).result;
    },
  },

  ndjson: {
    id: 'ndjson',
    name: 'NDJSON / JSON Lines',
    extensions: ['.ndjson', '.jsonl'],
    mimeTypes: ['application/x-ndjson'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: false,
      supportsTypes: true,
    },
    parse: (input: string) => {
      try {
        const lines = input.trim().split('\n').filter(Boolean);
        const data = lines.map((l) => JSON.parse(l));
        return { valid: true, data };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToNdjson(jsonStr).result;
    },
  },

  properties: {
    id: 'properties',
    name: 'Properties / .env',
    extensions: ['.properties', '.env'],
    mimeTypes: ['text/plain'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: false,
      supportsComments: true,
      supportsTypes: false,
    },
    parse: (input: string) => {
      const { result, error } = propertiesToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToProperties(jsonStr).result;
    },
  },

  ini: {
    id: 'ini',
    name: 'INI Configuration',
    extensions: ['.ini', '.cfg'],
    mimeTypes: ['text/plain'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: false,
      supportsComments: true,
      supportsTypes: false,
    },
    parse: (input: string) => {
      const { result, error } = propertiesToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToProperties(jsonStr).result;
    },
  },

  hcl: {
    id: 'hcl',
    name: 'HCL / Terraform',
    extensions: ['.hcl', '.tf'],
    mimeTypes: ['text/x-hcl', 'text/plain'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: (input: string) => {
      const { result, error } = propertiesToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      return JSON.stringify(parsed, null, 2);
    },
  },

  json5: {
    id: 'json5',
    name: 'JSON5 / JSONC',
    extensions: ['.json5', '.jsonc'],
    mimeTypes: ['application/json5', 'application/jsonc'],
    capabilities: {
      supportsNestedObjects: true,
      supportsArrays: true,
      supportsComments: true,
      supportsTypes: true,
    },
    parse: (input: string) => {
      try {
        const cleaned = input.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/,\s*([}\]])/g, '$1');
        return { valid: true, data: JSON.parse(cleaned) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any, indent = 2) => {
      const space = indent === 'tab' ? '\t' : Number(indent) || 2;
      return JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, space);
    },
  },

  env: {
    id: 'env',
    name: 'Dotenv Environment',
    extensions: ['.env'],
    mimeTypes: ['text/plain'],
    capabilities: {
      supportsNestedObjects: false,
      supportsArrays: false,
      supportsComments: true,
      supportsTypes: false,
    },
    parse: (input: string) => {
      const { result, error } = propertiesToJson(input);
      if (error) return { valid: false, error };
      try {
        return { valid: true, data: JSON.parse(result) };
      } catch (err: any) {
        return { valid: false, error: err.message };
      }
    },
    serialize: (data: any) => {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
      return jsonToProperties(jsonStr).result;
    },
  },
};

/**
 * Gets a format adapter by ID.
 */
export function getFormatAdapter(id: string): FormatAdapter | null {
  return FORMAT_ADAPTERS[id.toLowerCase()] || null;
}

/**
 * Returns default file extension for a given format ID or title.
 */
export function getFileExtensionForFormat(formatOrTitle: string): string {
  const normalized = formatOrTitle.toLowerCase();

  // Handle explicit target format titles like "JSON to CSV" or "JSON ➔ XML"
  if (normalized.includes('csv')) return '.csv';
  if (normalized.includes('xml')) return '.xml';
  if (normalized.includes('yaml') || normalized.includes('yml')) return '.yml';
  if (normalized.includes('sql')) return '.sql';
  if (normalized.includes('toml')) return '.toml';
  if (normalized.includes('markdown') || normalized.includes('md')) return '.md';
  if (normalized.includes('html')) return '.html';
  if (normalized.includes('typescript') || normalized.includes('interface')) return '.ts';
  if (normalized.includes('python')) return '.py';
  if (normalized.includes('php')) return '.php';
  if (normalized.includes('ndjson') || normalized.includes('jsonl')) return '.ndjson';
  if (normalized.includes('properties') || normalized.includes('env')) return '.properties';
  if (normalized.includes('schema')) return '.schema.json';

  for (const adapter of Object.values(FORMAT_ADAPTERS)) {
    if (adapter.id === normalized || adapter.name.toLowerCase() === normalized) {
      return adapter.extensions[0] || '.txt';
    }
  }

  return '.json';
}

/**
 * Executes a normalized conversion between source and target formats.
 */
export function convertFormat(
  input: string,
  sourceFormat: string,
  targetFormat: string,
  indent: string | number = 2
): ConversionResult {
  const startTime = performance.now();
  const sourceAdapter = getFormatAdapter(sourceFormat) || FORMAT_ADAPTERS['json'];
  const targetAdapter = getFormatAdapter(targetFormat) || FORMAT_ADAPTERS['json'];

  const parseRes = sourceAdapter.parse(input);
  if (!parseRes.valid) {
    return {
      outputText: input,
      sourceFormat,
      targetFormat,
      valid: false,
      errors: [{ message: parseRes.error || 'Failed to parse source format' }],
      warnings: [],
      durationMs: performance.now() - startTime,
      isLossy: false,
    };
  }

  const outputText = targetAdapter.serialize(parseRes.data, indent);
  const isLossy =
    !targetAdapter.capabilities.supportsNestedObjects && typeof parseRes.data === 'object';
  const warnings: ConversionWarning[] = [];

  if (isLossy) {
    warnings.push({
      code: 'LOSSY_CONVERSION',
      message: `${targetAdapter.name} does not natively support deeply nested objects. Keys were flattened or stringified.`,
    });
  }

  return {
    outputText,
    parsedObj: parseRes.data,
    sourceFormat,
    targetFormat,
    valid: true,
    errors: [],
    warnings,
    durationMs: performance.now() - startTime,
    isLossy,
    lossyDetails: isLossy ? [warnings[0].message] : [],
  };
}
