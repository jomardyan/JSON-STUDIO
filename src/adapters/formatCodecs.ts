import {
  csvToJson,
  jsonToCsv,
  jsonToHtmlTable,
  jsonToMarkdownTable,
  jsonToNdjson,
  jsonToPhpArray,
  jsonToProperties,
  jsonToPythonDict,
  jsonToSql,
  jsonToToml,
  jsonToTsInterface,
  jsonToUrlEncoded,
  jsonToXml,
  jsonToYaml,
  markdownTableToJson,
  propertiesToJson,
  repairJson,
  sqlToJson,
  tomlToJson,
  urlEncodedToJson,
  xmlToJson,
  yamlToJson,
} from '../utils/jsonUtils';
import type { FormatSerializationOptions } from './formatRegistry';

export interface ParseResult {
  valid: boolean;
  data?: unknown;
  error?: string;
}

export interface FormatCodec {
  parse: (input: string, options?: FormatSerializationOptions) => ParseResult;
  serialize: (data: unknown, indent?: string | number, options?: FormatSerializationOptions) => string;
}

const ok = (data: unknown): ParseResult => ({ valid: true, data });
const fail = (error: unknown, fallback: string): ParseResult => ({
  valid: false,
  error: error instanceof Error ? error.message : fallback,
});
const indentValue = (indent: string | number = 2) => (indent === 'tab' ? '\t' : Number(indent) || 2);
const fromJsonResult = (result: string, error?: string): ParseResult => {
  if (error) return { valid: false, error };
  try {
    return ok(JSON.parse(result));
  } catch (parseError: unknown) {
    return fail(parseError, 'Conversion did not return valid JSON');
  }
};

function parsePrimitive(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  const unquoted = quoted ? trimmed.slice(1, -1) : trimmed;

  if (/^(true|false)$/i.test(unquoted)) return unquoted.toLowerCase() === 'true';
  if (/^(null|nil|none)$/i.test(unquoted)) return null;
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(unquoted)) return Number(unquoted);
  if (/^[\[{].*[\]}]$/s.test(unquoted)) {
    try {
      return JSON.parse(unquoted);
    } catch {
      return unquoted;
    }
  }
  return unquoted.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
}

function stringifyScalar(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function flattenObject(value: unknown, prefix = '', target: Record<string, unknown> = {}) {
  if (Array.isArray(value)) {
    target[prefix || 'value'] = value;
    return target;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const nextKey = prefix ? `${prefix}.${key}` : key;
      if (child && typeof child === 'object' && !Array.isArray(child)) flattenObject(child, nextKey, target);
      else target[nextKey] = child;
    }
    return target;
  }
  target[prefix || 'value'] = value;
  return target;
}

function parseIni(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let section = result;
  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    const sectionMatch = line.match(/^\[([^\]]+)]$/);
    if (sectionMatch) {
      section = {};
      result[sectionMatch[1].trim()] = section;
      continue;
    }
    const separator = line.search(/[=:]/);
    if (separator > 0) section[line.slice(0, separator).trim()] = parsePrimitive(line.slice(separator + 1));
  }
  return result;
}

function serializeIni(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return `value=${stringifyScalar(data)}`;
  const root: string[] = [];
  const sections: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const lines = Object.entries(value as Record<string, unknown>).map(
        ([childKey, childValue]) => `${childKey}=${stringifyScalar(childValue)}`
      );
      sections.push(`[${key}]\n${lines.join('\n')}`);
    } else root.push(`${key}=${stringifyScalar(value)}`);
  }
  return [...root, ...sections].filter(Boolean).join('\n\n');
}

function parseEnv(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const rawLine of input.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const comment = value.search(/\s+#/);
      if (comment >= 0) value = value.slice(0, comment).trim();
    }
    result[key] = parsePrimitive(value);
  }
  return result;
}

function serializeEnv(data: unknown): string {
  return Object.entries(flattenObject(data))
    .map(([key, value]) => {
      const envKey = key.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
      const envValue =
        typeof value === 'string'
          ? JSON.stringify(value)
          : value === null || value === undefined
            ? ''
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value);
      return `${envKey}=${envValue}`;
    })
    .join('\n');
}

function parseHcl(input: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const stack = [root];
  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.replace(/\/\/.*$/, '').replace(/#.*$/, '').trim();
    if (!line) continue;
    const block = line.match(/^([A-Za-z_][\w-]*)(?:\s+"([^"]+)")?(?:\s+"([^"]+)")?\s*\{$/);
    if (block) {
      const key = [block[1], block[2], block[3]].filter(Boolean).join('.');
      const value: Record<string, unknown> = {};
      stack[stack.length - 1][key] = value;
      stack.push(value);
    } else if (line === '}') {
      if (stack.length > 1) stack.pop();
    } else {
      const assignment = line.match(/^([A-Za-z_][\w.-]*)\s*=\s*(.+)$/);
      if (assignment) stack[stack.length - 1][assignment[1]] = parsePrimitive(assignment[2]);
    }
  }
  return root;
}

function serializeHcl(data: unknown, level = 0): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return `value = ${stringifyScalar(data)}`;
  const indent = '  '.repeat(level);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${indent}${key} {`, serializeHcl(value, level + 1), `${indent}}`);
    } else lines.push(`${indent}${key} = ${stringifyScalar(value)}`);
  }
  return lines.join('\n');
}

function parseHtmlTable(input: string): unknown[] {
  const rows = [...input.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  if (rows.length < 2) throw new Error('HTML table requires a header and data row');
  const cells = (row: string) =>
    [...row.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((match) =>
      match[1]
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .trim()
    );
  const headers = cells(rows[0][1]);
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, parsePrimitive(cells(row[1])[index] ?? '')]))
  );
}

const unsupported = (name: string): FormatCodec => ({
  parse: () => ({ valid: false, error: `${name} parsing is not supported` }),
  serialize: () => '',
});

export const formatCodecs: Record<string, FormatCodec> = {
  json: {
    parse: (input) => {
      try { return ok(JSON.parse(input)); } catch (error: unknown) { return fail(error, 'Invalid JSON'); }
    },
    serialize: (data, indent = 2) => JSON.stringify(data, null, indentValue(indent)),
  },
  csv: {
    parse: (input, options) => { try { return ok(csvToJson(input, options?.csvOptions)); } catch (error: unknown) { return fail(error, 'Invalid CSV'); } },
    serialize: (data, _indent, options) => jsonToCsv(data, options?.csvOptions),
  },
  xml: {
    parse: (input) => { try { return ok(xmlToJson(input)); } catch (error: unknown) { return fail(error, 'Invalid XML'); } },
    serialize: (data, _indent, options) => jsonToXml(data, options?.xmlOptions),
  },
  yaml: {
    parse: (input) => { const value = yamlToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data) => jsonToYaml(JSON.stringify(data)).result,
  },
  toml: {
    parse: (input) => { const value = tomlToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data) => jsonToToml(JSON.stringify(data)).result,
  },
  sql: {
    parse: (input) => { const value = sqlToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data, _indent, options) => jsonToSql(JSON.stringify(data), options?.sqlOptions).result,
  },
  markdown: {
    parse: (input) => { const value = markdownTableToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data) => jsonToMarkdownTable(JSON.stringify(data)).result,
  },
  html: {
    parse: (input) => { try { return ok(parseHtmlTable(input)); } catch (error: unknown) { return fail(error, 'Invalid HTML table'); } },
    serialize: (data) => jsonToHtmlTable(JSON.stringify(data)).result,
  },
  'ts-interface': { ...unsupported('TypeScript'), serialize: (data) => jsonToTsInterface(JSON.stringify(data)).result },
  python: { ...unsupported('Python dict'), serialize: (data) => jsonToPythonDict(JSON.stringify(data)).result },
  php: { ...unsupported('PHP array'), serialize: (data) => jsonToPhpArray(JSON.stringify(data)).result },
  ndjson: {
    parse: (input) => {
      try { return ok(input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line))); }
      catch (error: unknown) { return fail(error, 'Invalid NDJSON'); }
    },
    serialize: (data) => jsonToNdjson(JSON.stringify(data)).result,
  },
  properties: {
    parse: (input) => { const value = propertiesToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data) => jsonToProperties(JSON.stringify(data)).result,
  },
  ini: {
    parse: (input) => { try { return ok(parseIni(input)); } catch (error: unknown) { return fail(error, 'Invalid INI'); } },
    serialize: serializeIni,
  },
  hcl: {
    parse: (input) => { try { return ok(parseHcl(input)); } catch (error: unknown) { return fail(error, 'Invalid HCL'); } },
    serialize: (data) => serializeHcl(data),
  },
  json5: {
    parse: (input) => {
      try { const repaired = repairJson(input); return ok(JSON.parse(repaired.repaired)); }
      catch (error: unknown) { return fail(error, 'Invalid JSON5 or JSONC'); }
    },
    serialize: (data, indent = 2) => JSON.stringify(data, null, indentValue(indent)),
  },
  env: {
    parse: (input) => { try { return ok(parseEnv(input)); } catch (error: unknown) { return fail(error, 'Invalid dotenv'); } },
    serialize: serializeEnv,
  },
  urlencoded: {
    parse: (input) => { const value = urlEncodedToJson(input); return fromJsonResult(value.result, value.error); },
    serialize: (data) => jsonToUrlEncoded(JSON.stringify(data)).result,
  },
};
