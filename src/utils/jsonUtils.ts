import { ValidationResult, ValidationError, TransformationStats, CsvOptions, XmlOptions, SqlOptions, DataFormat } from '../types';

/**
 * Automatically detects/deduces the format of an input string.
 */
export function detectFormat(input: string): DataFormat {
  if (!input || !input.trim()) return 'json';

  const trimmed = input.trim();

  // 1. JSON check
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed !== null) {
      return 'json';
    }
  } catch {}

  // 2. NDJSON check (multiple lines, each is valid JSON)
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    let allJson = true;
    for (const l of lines) {
      if (!((l.startsWith('{') && l.endsWith('}')) || (l.startsWith('[') && l.endsWith(']')))) {
        allJson = false;
        break;
      }
      try {
        JSON.parse(l);
      } catch {
        allJson = false;
        break;
      }
    }
    if (allJson) return 'ndjson';
  }

  // 3. XML check
  if ((trimmed.startsWith('<') && trimmed.endsWith('>')) || /^<\?xml/i.test(trimmed)) {
    return 'xml';
  }

  // 4. Markdown table check
  if (lines.length >= 2 && lines.every((l) => l.startsWith('|') && l.endsWith('|'))) {
    return 'markdown';
  }

  // 5. SQL check
  if (/^(INSERT\s+INTO|SELECT\s+|CREATE\s+TABLE|UPDATE\s+|DELETE\s+FROM)/i.test(trimmed)) {
    return 'sql';
  }

  // 6. URL Query String check
  if ((trimmed.includes('=') && trimmed.includes('&')) || /^https?:\/\//i.test(trimmed) || /^\?[a-zA-Z0-9_.]+=/i.test(trimmed)) {
    return 'urlencoded';
  }

  // 7. CSV check (multiple lines with matching column count) — before TOML/YAML to avoid false positives
  if (lines.length > 1) {
    const firstDelim = [',', '\t', ';', '|'].find((d) => lines[0].includes(d));
    if (firstDelim) {
      const counts = lines.slice(0, 5).map((l) => l.split(firstDelim).length);
      if (counts.length > 1 && counts.every((c) => c === counts[0] && c > 1)) {
        return 'csv';
      }
    }
  }

  // 8. TOML check
  if (/^\[[a-zA-Z0-9_.-]+\]/m.test(trimmed) || /^[a-zA-Z0-9_.-]+\s*=\s*(?:"[^"]*"|'[^']*'|\d+|true|false|\[)/m.test(trimmed)) {
    return 'toml';
  }

  // 9. YAML check
  if (/^[a-zA-Z0-9_.-]+\s*:\s*.+/m.test(trimmed)) {
    return 'yaml';
  }

  // 10. Properties / .env check
  if (/^[a-zA-Z0-9_.-]+\s*=\s*.+/m.test(trimmed)) {
    return 'properties';
  }

  return 'json';
}

/**
 * Validates a JSON string and extracts line/column if an error occurs.
 */
export function validateJson(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { valid: true, error: null, parsed: null };
  }

  try {
    const parsed = JSON.parse(input);
    return { valid: true, error: null, parsed };
  } catch (err: any) {
    const message = err.message || 'Invalid JSON syntax';
    const errorDetails = parseJsonErrorDetails(input, message);
    return { valid: false, error: errorDetails, parsed: null };
  }
}

/**
 * Parses error position details from standard JSON.parse exception messages.
 */
function parseJsonErrorDetails(input: string, errorMessage: string): ValidationError {
  let position: number | undefined;
  let line: number | undefined;
  let column: number | undefined;

  // Pattern matching for Chrome/V8: "Unexpected token X in JSON at position 123"
  // or "Unexpected end of JSON input"
  const posMatch = errorMessage.match(/at position (\d+)/i);
  if (posMatch && posMatch[1]) {
    position = parseInt(posMatch[1], 10);
  } else {
    // Chrome/Edge "at line X column Y"
    const lineColMatch = errorMessage.match(/at line (\d+) column (\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    }
  }

  // Calculate line and column if position was found
  if (position !== undefined) {
    const lines = input.slice(0, position).split('\n');
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  let snippet = '';
  if (line !== undefined) {
    const allLines = input.split('\n');
    const targetLine = allLines[line - 1] || '';
    snippet = targetLine.trim();
  }

  return {
    message: errorMessage,
    line,
    column,
    snippet,
    position,
  };
}

/**
 * Pretty-prints a JSON string with specified indentation.
 */
export function formatJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    return { result: JSON.stringify(parsed, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Minifies a JSON string by stripping all whitespace.
 */
export function minifyJson(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Auto-repairs common JSON syntax errors:
 * - Single quotes replaced with double quotes
 * - Unquoted object keys
 * - Trailing commas in arrays and objects
 * - JavaScript comments (// and /* ... *\/)
 * - Python literals True, False, None -> true, false, null
 */
export function repairJson(input: string): { repaired: string; fixed: boolean; message: string } {
  if (!input || !input.trim()) {
    return { repaired: input, fixed: false, message: 'Input is empty' };
  }

  // Check if it's already valid
  try {
    JSON.parse(input);
    return { repaired: input, fixed: false, message: 'JSON is already valid!' };
  } catch {
    // Proceed to repair
  }

  let str = input;

  // 1. Remove single-line comments // ... and multi-line comments /* ... */
  str = str.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

  // 2. Replace Python boolean/null keywords: True -> true, False -> false, None -> null
  str = str.replace(/\bTrue\b/g, 'true');
  str = str.replace(/\bFalse\b/g, 'false');
  str = str.replace(/\bNone\b/g, 'null');

  // 3. Fix unquoted keys e.g. { name: "John", age: 30 } -> { "name": "John", "age": 30 }
  // Match key patterns before colon
  str = str.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

  // 4. Replace single-quoted string values with double quotes.
  // Uses a stateful parser to avoid breaking on apostrophes inside values.
  str = replaceSingleQuotedStrings(str);

  // 5. Remove trailing commas before } or ]
  str = str.replace(/,\s*([}\]])/g, '$1');

  // Check if repair succeeded
  try {
    const parsed = JSON.parse(str);
    return {
      repaired: JSON.stringify(parsed, null, 2),
      fixed: true,
      message: 'Successfully repaired JSON syntax errors!',
    };
  } catch (err: any) {
    return {
      repaired: str,
      fixed: false,
      message: `Partial repair applied, but syntax error remains: ${err.message}`,
    };
  }
}

/**
 * Converts a JSON structure (object or array) into CSV format.
 */
export function jsonToCsv(jsonObj: any, options?: CsvOptions): string {
  const delimiter = options?.delimiter || ',';
  const includeHeader = options?.header ?? true;

  if (jsonObj === null || jsonObj === undefined) return '';

  let records: any[] = [];
  if (Array.isArray(jsonObj)) {
    records = jsonObj;
  } else if (typeof jsonObj === 'object') {
    // Check if object contains an array inside
    const arrayKey = Object.keys(jsonObj).find((k) => Array.isArray(jsonObj[k]));
    if (arrayKey) {
      records = jsonObj[arrayKey];
    } else {
      records = [jsonObj];
    }
  } else {
    records = [{ value: jsonObj }];
  }

  if (records.length === 0) return '';

  // Flatten nested structures if needed
  const flattenedRecords = records.map((rec) =>
    typeof rec === 'object' && rec !== null ? flattenObject(rec) : { value: rec }
  );

  // Collect all unique keys across all records
  const headersSet = new Set<string>();
  flattenedRecords.forEach((rec) => {
    Object.keys(rec).forEach((k) => headersSet.add(k));
  });
  const headers = Array.from(headersSet);

  const escapeCsvCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);

    // Escape quotes and wrap if contains delimiter, newline, or quotes
    const needsQuotes = str.includes(delimiter) || str.includes('\n') || str.includes('\r') || str.includes('"');
    if (needsQuotes) {
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return str;
  };

  const lines: string[] = [];

  if (includeHeader) {
    lines.push(headers.map(escapeCsvCell).join(delimiter));
  }

  flattenedRecords.forEach((rec) => {
    const row = headers.map((h) => escapeCsvCell(rec[h]));
    lines.push(row.join(delimiter));
  });

  return lines.join('\n');
}

/**
 * Helper to flatten nested objects into dot-notation keys: e.g. { user: { name: "Alice" } } -> { "user.name": "Alice" }
 */
function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const propName = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];

    if (val !== null && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length > 0) {
      Object.assign(flattened, flattenObject(val, propName));
    } else if (Array.isArray(val)) {
      // If array contains primitives, join them; otherwise stringify
      const isSimple = val.every((v) => typeof v !== 'object' || v === null);
      flattened[propName] = isSimple ? val.join('; ') : JSON.stringify(val);
    } else {
      flattened[propName] = val;
    }
  }

  return flattened;
}

/**
 * Converts a CSV string to JSON array of objects.
 */
export function csvToJson(csvStr: string, options?: CsvOptions): any[] {
  const delimiter = options?.delimiter || detectDelimiter(csvStr);
  const lines = parseCsvLines(csvStr, delimiter);

  if (lines.length === 0) return [];

  const headers = lines[0].map((h) => h.trim());
  const result: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length === 1 && row[0].trim() === '') continue; // skip empty line

    const obj: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      const rawVal = row[colIndex] !== undefined ? row[colIndex] : '';
      obj[header || `col_${colIndex + 1}`] = parsePrimitive(rawVal);
    });
    result.push(obj);
  }

  return result;
}

function parsePrimitive(val: string): any {
  const trimmed = val.trim();
  if (trimmed === '') return '';
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (trimmed.toLowerCase() === 'null') return null;
  // Avoid coercing leading-zero strings like "007", "01234" (zip codes, IDs) to numbers.
  // Allow "0", "0.5", etc.
  if (
    !isNaN(Number(trimmed)) &&
    !trimmed.startsWith('0x') &&
    !(trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.'))
  ) {
    return Number(trimmed);
  }
  return val;
}

/**
 * Replaces single-quoted JSON string values with double quotes,
 * handling apostrophes inside words (e.g. O'Brien) correctly.
 */
function replaceSingleQuotedStrings(str: string): string {
  let result = '';
  let i = 0;
  while (i < str.length) {
    if (str[i] === '"') {
      // Skip double-quoted string
      result += '"';
      i++;
      while (i < str.length && str[i] !== '"') {
        if (str[i] === '\\') { result += str[i++]; }
        if (i < str.length) { result += str[i++]; }
      }
      if (i < str.length) { result += str[i++]; } // closing "
    } else if (str[i] === "'") {
      // Check if this is a JSON string value (preceded by : or , or [ or start)
      const preceding = result.trimEnd();
      const lastChar = preceding[preceding.length - 1];
      if (lastChar === ':' || lastChar === ',' || lastChar === '[' || lastChar === '{') {
        // Collect until matching unescaped single quote
        i++; // skip opening '
        let inner = '';
        while (i < str.length) {
          if (str[i] === "'" && str[i + 1] !== "'") {
            // Check if this is a closing quote (not an apostrophe mid-word)
            // Heuristic: closing quote is followed by ,  }  ] or whitespace+one of those
            const after = str.slice(i + 1).trimStart();
            if (!after || /^[,}\]:]/.test(after)) {
              break; // closing quote
            }
          }
          if (str[i] === '\\') { inner += str[i++]; }
          if (i < str.length) { inner += str[i++]; }
        }
        const sanitized = inner.replace(/"/g, '\\"').replace(/\\'/g, "'");
        result += `"${sanitized}"`;
        if (i < str.length) i++; // skip closing '
      } else {
        result += str[i++];
      }
    } else {
      result += str[i++];
    }
  }
  return result;
}

function detectDelimiter(csv: string): string {
  const firstLine = csv.split('\n')[0] || '';
  if (firstLine.includes('\t')) return '\t';
  if (firstLine.includes(';')) return ';';
  if (firstLine.includes('|')) return '|';
  return ',';
}

/**
 * Parses CSV lines respecting quoted fields and line breaks inside quotes.
 */
function parseCsvLines(csv: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle \r\n
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Converts JSON to XML string with custom root and tag naming.
 */
export function jsonToXml(jsonObj: any, options?: XmlOptions): string {
  const rootName = options?.rootName || 'root';
  const indent = options?.indent || '  ';

  function buildXml(val: any, nodeName: string, depth: number): string {
    const spaces = indent.repeat(depth);
    const safeNodeName = sanitizeXmlTag(nodeName);

    if (val === null || val === undefined) {
      return `${spaces}<${safeNodeName} />`;
    }

    if (typeof val !== 'object') {
      return `${spaces}<${safeNodeName}>${escapeXml(String(val))}</${safeNodeName}>`;
    }

    if (Array.isArray(val)) {
      const itemTag = safeNodeName === 'root' ? 'item' : singularize(safeNodeName);
      return val.map((item) => buildXml(item, itemTag, depth)).join('\n');
    }

    // Object
    const keys = Object.keys(val);
    if (keys.length === 0) {
      return `${spaces}<${safeNodeName} />`;
    }

    const childrenXml = keys
      .map((k) => buildXml(val[k], k, depth + 1))
      .join('\n');

    return `${spaces}<${safeNodeName}>\n${childrenXml}\n${spaces}</${safeNodeName}>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXml(jsonObj, rootName, 0)}`;
}

function sanitizeXmlTag(name: string): string {
  let cleaned = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (/^[0-9-]/.test(cleaned)) {
    cleaned = 'item_' + cleaned;
  }
  return cleaned || 'node';
}

function singularize(name: string): string {
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name.endsWith('s') && !name.endsWith('ss')) return name.slice(0, -1);
  return `${name}_item`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts XML string to JSON using browser DOMParser.
 */
export function xmlToJson(xmlStr: string): any {
  if (!xmlStr || !xmlStr.trim()) return null;

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

    // Check parsing error
    const parserError = xmlDoc.getElementsByTagName('parsererror')[0];
    if (parserError) {
      throw new Error(`XML Parsing Error: ${parserError.textContent || 'Invalid XML'}`);
    }

    return domNodeToObj(xmlDoc.documentElement);
  }

  // Fallback for non-browser / test environment
  return simpleXmlToJsonFallback(xmlStr);
}

function simpleXmlToJsonFallback(xmlStr: string): any {
  const clean = xmlStr.replace(/<\?xml[^>]*\?>/gi, '').trim();
  const tagRegex = /<([a-zA-Z0-9_-]+)>([\s\S]*?)<\/\1>/g;
  const result: Record<string, any> = {};
  let match;
  let count = 0;
  while ((match = tagRegex.exec(clean)) !== null) {
    count++;
    const key = match[1];
    const valStr = match[2].trim();
    // Use a separate regex to test for nested tags (avoid mutating tagRegex.lastIndex)
    const hasNestedTags = /<[a-zA-Z0-9_-]+>[\s\S]*?<\/[a-zA-Z0-9_-]+>/.test(valStr);
    const val = hasNestedTags ? simpleXmlToJsonFallback(valStr) : parsePrimitive(valStr);
    if (result[key] !== undefined) {
      if (!Array.isArray(result[key])) result[key] = [result[key]];
      result[key].push(val);
    } else {
      result[key] = val;
    }
  }
  return count > 0 ? result : parsePrimitive(clean);
}

function domNodeToObj(node: Element): any {
  // If element has no child elements, return text content or empty
  const hasChildElements = Array.from(node.childNodes).some((child) => child.nodeType === Node.ELEMENT_NODE);

  if (!hasChildElements) {
    const text = node.textContent?.trim() || '';
    return parsePrimitive(text);
  }

  const result: Record<string, any> = {};

  // Process attributes if present
  if (node.attributes && node.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      result['@attributes'][attr.name] = attr.value;
    }
  }

  // Process child nodes
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childName = child.tagName;
    const childObj = domNodeToObj(child);

    if (result[childName] !== undefined) {
      if (!Array.isArray(result[childName])) {
        result[childName] = [result[childName]];
      }
      result[childName].push(childObj);
    } else {
      result[childName] = childObj;
    }
  }

  return result;
}

/**
 * Computes metrics and statistics for transformation comparison.
 */
export function calculateStats(parsedJson: any, inputText: string, outputText: string): TransformationStats {
  const inputBytes = new Blob([inputText]).size;
  const outputBytes = new Blob([outputText]).size;
  const inputLines = inputText ? inputText.split('\n').length : 0;
  const outputLines = outputText ? outputText.split('\n').length : 0;

  let nodeCount = 0;
  let maxDepth = 0;
  let arrayCount = 0;
  let objectCount = 0;

  if (parsedJson !== null && parsedJson !== undefined) {
    function traverse(val: any, depth: number) {
      nodeCount++;
      if (depth > maxDepth) maxDepth = depth;

      if (Array.isArray(val)) {
        arrayCount++;
        val.forEach((item) => traverse(item, depth + 1));
      } else if (val !== null && typeof val === 'object') {
        objectCount++;
        Object.keys(val).forEach((k) => traverse(val[k], depth + 1));
      }
    }
    traverse(parsedJson, 1);
  }

  const compressionRatio = inputBytes > 0 ? Math.round(((inputBytes - outputBytes) / inputBytes) * 100) : 0;

  return {
    inputBytes,
    outputBytes,
    inputLines,
    outputLines,
    compressionRatio,
    nodeCount,
    maxDepth,
    arrayCount,
    objectCount,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '-' + formatBytes(-bytes);
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sorts object keys recursively (Alphabetical A-Z or Z-A).
 */
export function sortJsonKeys(input: string, direction: 'asc' | 'desc' = 'asc', indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    function sortRecursive(val: any): any {
      if (Array.isArray(val)) {
        return val.map(sortRecursive);
      } else if (val !== null && typeof val === 'object') {
        const sortedKeys = Object.keys(val).sort((a, b) => {
          return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        });
        const res: Record<string, any> = {};
        for (const key of sortedKeys) {
          res[key] = sortRecursive(val[key]);
        }
        return res;
      }
      return val;
    }

    const sortedData = sortRecursive(parsed);
    return { result: JSON.stringify(sortedData, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Removes null, undefined, empty strings, or empty arrays/objects recursively.
 */
export function removeEmptyValues(
  input: string,
  options: { removeNulls?: boolean; removeEmptyStrings?: boolean; removeEmptyObjects?: boolean } = {
    removeNulls: true,
    removeEmptyStrings: true,
    removeEmptyObjects: false,
  },
  indent: string | number = 2
): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    function cleanRecursive(val: any): any {
      if (Array.isArray(val)) {
        const cleaned = val.map(cleanRecursive).filter((item) => {
          if (options.removeNulls && (item === null || item === undefined)) return false;
          if (options.removeEmptyStrings && item === '') return false;
          return true;
        });
        return cleaned;
      } else if (val !== null && typeof val === 'object') {
        const res: Record<string, any> = {};
        for (const key of Object.keys(val)) {
          const item = cleanRecursive(val[key]);
          if (options.removeNulls && (item === null || item === undefined)) continue;
          if (options.removeEmptyStrings && item === '') continue;
          if (
            options.removeEmptyObjects &&
            typeof item === 'object' &&
            item !== null &&
            Object.keys(item).length === 0
          ) {
            continue;
          }
          res[key] = item;
        }
        return res;
      }
      return val;
    }

    const cleanedData = cleanRecursive(parsed);
    return { result: JSON.stringify(cleanedData, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Escapes JSON into a string literal (with escaped double quotes and linebreaks).
 */
export function escapeJson(input: string): { result: string; error?: string } {
  try {
    // Validate first if possible, or directly escape
    let str = input;
    try {
      const parsed = JSON.parse(input);
      str = JSON.stringify(parsed);
    } catch {
      // Use raw input if parsing fails
    }
    const escaped = JSON.stringify(str);
    return { result: escaped };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Unescapes an escaped string literal back to formatted JSON.
 */
export function unescapeJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    let trimmed = input.trim();

    // If string starts and ends with quotes, unescape via JSON.parse
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const unescapedString = JSON.parse(trimmed);
      if (typeof unescapedString === 'string') {
        try {
          const parsed = JSON.parse(unescapedString);
          return { result: JSON.stringify(parsed, null, space) };
        } catch {
          return { result: unescapedString };
        }
      }
      return { result: JSON.stringify(unescapedString, null, space) };
    }

    // Try unescaping replace rules manually
    const manualUnescaped = trimmed
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t');

    try {
      const parsed = JSON.parse(manualUnescaped);
      return { result: JSON.stringify(parsed, null, space) };
    } catch {
      return { result: manualUnescaped };
    }
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Base64 encodes UTF-8 string safely.
 */
export function encodeBase64(input: string): { result: string; error?: string } {
  try {
    // UTF-8 friendly Base64 encoding
    const encoded = btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return { result: encoded };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Base64 decodes string back to UTF-8 / JSON string.
 */
export function decodeBase64(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    const cleanInput = input.trim().replace(/\s/g, '');
    const decoded = decodeURIComponent(
      Array.prototype.map
        .call(atob(cleanInput), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // If decoded result is valid JSON, format it nicely
    try {
      const parsed = JSON.parse(decoded);
      return { result: JSON.stringify(parsed, null, space) };
    } catch {
      return { result: decoded };
    }
  } catch (err: any) {
    return { result: input, error: `Invalid Base64 string: ${err.message}` };
  }
}

/**
 * Flattens nested JSON object into flat dot-notation object keys.
 */
export function flattenJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    const flattened = flattenObject(parsed);
    return { result: JSON.stringify(flattened, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Unflattens dot-notation keys back into nested JSON.
 */
export function unflattenJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { result: input, error: 'Input must be a flat JSON object' };
    }

    const unflattened: Record<string, any> = {};

    for (const key of Object.keys(parsed)) {
      const keys = key.split('.');
      let current = unflattened;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (i === keys.length - 1) {
          current[k] = parsed[key];
        } else {
          if (!current[k] || typeof current[k] !== 'object' || Array.isArray(current[k])) {
            current[k] = {};
          }
          current = current[k];
        }
      }
    }

    return { result: JSON.stringify(unflattened, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Generates JSON Schema (Draft-07 compliant format).
 */
export function generateJsonSchema(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    function buildSchema(val: any): Record<string, any> {
      if (val === null) {
        return { type: 'null' };
      }

      const type = typeof val;

      if (type === 'boolean') {
        return { type: 'boolean' };
      }

      if (type === 'number') {
        return { type: Number.isInteger(val) ? 'integer' : 'number' };
      }

      if (type === 'string') {
        return { type: 'string' };
      }

      if (Array.isArray(val)) {
        if (val.length === 0) {
          return { type: 'array', items: {} };
        }
        return {
          type: 'array',
          items: buildSchema(val[0]),
        };
      }

      if (type === 'object') {
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const k of Object.keys(val)) {
          properties[k] = buildSchema(val[k]);
          required.push(k);
        }

        return {
          type: 'object',
          properties,
          required,
        };
      }

      return { type: 'string' };
    }

    const builtSchema = buildSchema(parsed);
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'GeneratedSchema',
      ...builtSchema,
    };

    return { result: JSON.stringify(schema, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON to clean YAML format.
 */
export function jsonToYaml(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);

    function stringifyYaml(val: any, depth = 0): string {
      const indent = '  '.repeat(depth);

      if (val === null || val === undefined) return 'null';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') {
        // Quote strings that could be misinterpreted as YAML scalars (booleans, numbers, nulls)
        if (
          val.includes('\n') || val.includes(':') || val.includes('#') ||
          val.includes('"') || val.includes("'") ||
          /^(true|false|null|yes|no|on|off)$/i.test(val) ||
          (!isNaN(Number(val)) && val.trim() !== '')
        ) {
          return `"${val.replace(/"/g, '\\"')}"`;
        }
        return val || '""';
      }

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        return val
          .map((item) => {
            if (typeof item === 'object' && item !== null) {
              const itemYaml = stringifyYaml(item, depth + 1).trimStart();
              return `${indent}- ${itemYaml}`;
            }
            return `${indent}- ${stringifyYaml(item, 0)}`;
          })
          .join('\n');
      }

      if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length === 0) return '{}';
        return keys
          .map((key) => {
            const childVal = val[key];
            if (typeof childVal === 'object' && childVal !== null) {
              return `${indent}${key}:\n${stringifyYaml(childVal, depth + 1)}`;
            }
            return `${indent}${key}: ${stringifyYaml(childVal, 0)}`;
          })
          .join('\n');
      }

      return String(val);
    }

    return { result: stringifyYaml(parsed) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts SQL DDL or INSERT statements into JSON object or array of objects.
 */
export function sqlToJson(sqlInput: string, indent: string | number = 2): { result: string; error?: string } {
  if (!sqlInput || !sqlInput.trim()) {
    return { result: '[]' };
  }

  const space = indent === 'tab' ? '\t' : Number(indent) || 2;
  const cleanSql = sqlInput
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
    .replace(/--.*$/gm, '')
    .trim();

  try {
    const records: Record<string, any>[] = [];

    // Match INSERT INTO statements
    // Format: INSERT INTO table_name (col1, col2) VALUES (val1, val2), (val3, val4);
    const insertRegex = /INSERT\s+INTO\s+[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?);/gi;
    let match: RegExpExecArray | null;

    while ((match = insertRegex.exec(cleanSql)) !== null) {
      const colNames = match[2]
        .split(',')
        .map((c) => c.trim().replace(/[`"\[\]]/g, ''));
      const rawValuesBlock = match[3];

      // Parse tuples of values e.g. ('John', 30), ('Jane', 25)
      const rowTuples = parseSqlTuples(rawValuesBlock);

      for (const tuple of rowTuples) {
        const rowObj: Record<string, any> = {};
        colNames.forEach((col, idx) => {
          rowObj[col] = tuple[idx] !== undefined ? tuple[idx] : null;
        });
        records.push(rowObj);
      }
    }

    if (records.length > 0) {
      return { result: JSON.stringify(records, null, space) };
    }

    // Fallback: Check if it is a CREATE TABLE statement
    // Format: CREATE TABLE tableName ( col1 TYPE, col2 TYPE );
    const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"\[]?([a-zA-Z0-9_]+)[`"\]]?\s*\(([\s\S]+?)\);/i;
    const createMatch = createRegex.exec(cleanSql);

    if (createMatch) {
      const tableName = createMatch[1];
      const body = createMatch[2];
      const columnLines = body.split(',').map((l) => l.trim()).filter(Boolean);

      const columnsSchema: Record<string, string> = {};
      for (const line of columnLines) {
        if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|CONSTRAINT|INDEX|UNIQUE)/i.test(line)) continue;
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const colName = parts[0].replace(/[`"\[\]]/g, '');
          const colType = parts[1].toUpperCase();
          columnsSchema[colName] = colType;
        }
      }

      return {
        result: JSON.stringify(
          {
            table: tableName,
            columns: columnsSchema,
          },
          null,
          space
        ),
      };
    }

    return { result: '[]', error: 'Could not parse SQL statements into JSON records. Ensure SQL contains INSERT INTO or CREATE TABLE statements.' };
  } catch (err: any) {
    return { result: sqlInput, error: `SQL parsing error: ${err.message}` };
  }
}

/**
 * Helper to parse SQL value tuples like: ('val1', 123, NULL), ('val2', 456, TRUE)
 */
function parseSqlTuples(valuesBlock: string): any[][] {
  const tuples: any[][] = [];
  let currentTuple: any[] = [];
  let currentVal = '';
  let inString = false;
  let stringChar = '';
  let inTuple = false;

  for (let i = 0; i < valuesBlock.length; i++) {
    const char = valuesBlock[i];
    const nextChar = valuesBlock[i + 1];

    if (inString) {
      if (char === stringChar) {
        if (nextChar === stringChar) {
          currentVal += stringChar; // Escaped quote
          i++;
        } else {
          inString = false; // End string
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
      } else if (char === '(' && !inTuple) {
        inTuple = true;
        currentTuple = [];
        currentVal = '';
      } else if (char === ')' && inTuple) {
        currentTuple.push(parseSqlPrimitive(currentVal));
        tuples.push(currentTuple);
        currentTuple = [];
        currentVal = '';
        inTuple = false;
      } else if (char === ',' && inTuple) {
        currentTuple.push(parseSqlPrimitive(currentVal));
        currentVal = '';
      } else if (inTuple) {
        currentVal += char;
      }
    }
  }

  return tuples;
}

function parseSqlPrimitive(valStr: string): any {
  const trimmed = valStr.trim();
  if (trimmed === '' || trimmed.toUpperCase() === 'NULL') return null;
  if (trimmed.toUpperCase() === 'TRUE') return true;
  if (trimmed.toUpperCase() === 'FALSE') return false;
  if (!isNaN(Number(trimmed))) return Number(trimmed);

  // Try parsing inner JSON string if applicable
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  return trimmed;
}

/**
 * Converts JSON (object or array) to SQL INSERT queries and CREATE TABLE schema.
 */
export function jsonToSql(input: string, options?: SqlOptions): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const tableName = options?.tableName || 'records';
    const dialect = options?.dialect || 'mysql';
    const includeCreateTable = options?.includeCreateTable ?? true;
    const batchSize = Math.max(1, options?.insertBatchSize || 100);
    const quoteIdentifiers = options?.quoteIdentifiers ?? true;
    const primaryKey = options?.primaryKey || 'id';

    let records: any[] = [];
    if (Array.isArray(parsed)) {
      records = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      records = [parsed];
    } else {
      records = [{ value: parsed }];
    }

    if (records.length === 0) {
      return { result: `-- No records found to generate SQL for table '${tableName}'` };
    }

    // Flatten records to simple key-value pairs
    const flattenedRecords = records.map((rec) =>
      typeof rec === 'object' && rec !== null ? flattenObject(rec) : { value: rec }
    );

    // Collect all column names
    const columnsSet = new Set<string>();
    flattenedRecords.forEach((rec) => {
      Object.keys(rec).forEach((k) => columnsSet.add(k));
    });
    const columns = Array.from(columnsSet);

    if (columns.length === 0) {
      return { result: `-- No columns found` };
    }

    // Helper for identifier quoting per dialect
    function quoteId(id: string): string {
      if (!quoteIdentifiers) return id;
      const clean = id.replace(/[`"\[\]]/g, '');
      if (dialect === 'postgres' || dialect === 'sqlite') {
        return `"${clean}"`;
      }
      if (dialect === 'mssql') {
        return `[${clean}]`;
      }
      return `\`${clean}\``; // MySQL
    }

    // Helper for formatting value literal per dialect
    function formatSqlValue(val: any): string {
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
      if (typeof val === 'boolean') {
        if (dialect === 'mssql') return val ? '1' : '0';
        return val ? 'TRUE' : 'FALSE';
      }
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
      return `'${String(val).replace(/'/g, "''")}'`;
    }

    const outputLines: string[] = [`-- SQL Script for table ${quoteId(tableName)} (Dialect: ${dialect.toUpperCase()})`];

    // 1. Generate CREATE TABLE DDL
    if (includeCreateTable) {
      const colDefinitions: string[] = [];

      columns.forEach((col) => {
        const sampleValues = flattenedRecords.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
        const colType = inferSqlColumnType(sampleValues, dialect);
        const isPk = col.toLowerCase() === primaryKey.toLowerCase();
        let def = `  ${quoteId(col)} ${colType}`;

        if (isPk) {
          if (dialect === 'mysql') def += ' PRIMARY KEY';
          else if (dialect === 'postgres') def += colType.includes('INT') ? ' PRIMARY KEY' : ' PRIMARY KEY';
          else if (dialect === 'sqlite') def += ' PRIMARY KEY';
          else if (dialect === 'mssql') def += ' PRIMARY KEY';
        }

        colDefinitions.push(def);
      });

      const createSql = `CREATE TABLE IF NOT EXISTS ${quoteId(tableName)} (\n${colDefinitions.join(',\n')}\n);`;
      outputLines.push(createSql, '');
    }

    // 2. Generate INSERT Statements (Single or Batch)
    const escapedCols = columns.map(quoteId).join(', ');

    if (batchSize === 1) {
      // Individual INSERT lines
      flattenedRecords.forEach((rec) => {
        const values = columns.map((col) => formatSqlValue(rec[col])).join(', ');
        outputLines.push(`INSERT INTO ${quoteId(tableName)} (${escapedCols}) VALUES (${values});`);
      });
    } else {
      // Multi-row batch INSERT
      for (let i = 0; i < flattenedRecords.length; i += batchSize) {
        const chunk = flattenedRecords.slice(i, i + batchSize);
        const valueTuples = chunk.map(
          (rec) => `  (${columns.map((col) => formatSqlValue(rec[col])).join(', ')})`
        );

        if (valueTuples.length > 0) {
          outputLines.push(
            `INSERT INTO ${quoteId(tableName)} (${escapedCols}) VALUES\n${valueTuples.join(',\n')};`
          );
        }
      }
    }

    return { result: outputLines.join('\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Infers SQL data type from array of sample JS values.
 */
function inferSqlColumnType(values: any[], dialect: string): string {
  if (values.length === 0) return 'VARCHAR(255)';

  let isInt = true;
  let isNum = true;
  let isBool = true;
  let maxLen = 0;

  for (const v of values) {
    if (typeof v !== 'boolean') isBool = false;
    if (typeof v !== 'number') {
      isNum = false;
      isInt = false;
    } else {
      if (!Number.isInteger(v)) isInt = false;
    }
    const str = String(v);
    if (str.length > maxLen) maxLen = str.length;
  }

  if (isBool) {
    if (dialect === 'mssql') return 'BIT';
    return 'BOOLEAN';
  }

  if (isInt) {
    return 'INT';
  }

  if (isNum) {
    if (dialect === 'postgres') return 'DOUBLE PRECISION';
    if (dialect === 'sqlite') return 'REAL';
    return 'DOUBLE';
  }

  if (maxLen > 255) {
    return dialect === 'postgres' ? 'TEXT' : 'TEXT';
  }

  return 'VARCHAR(255)';
}

/**
 * Converts JSON object or array to HTML <table> markup.
 */
export function jsonToHtmlTable(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);

    let records: any[] = [];
    if (Array.isArray(parsed)) {
      records = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      records = [parsed];
    } else {
      records = [{ value: parsed }];
    }

    if (records.length === 0) {
      return { result: '<table><tbody><tr><td>No data available</td></tr></tbody></table>' };
    }

    const flattenedRecords = records.map((rec) =>
      typeof rec === 'object' && rec !== null ? flattenObject(rec) : { value: rec }
    );

    const headersSet = new Set<string>();
    flattenedRecords.forEach((rec) => {
      Object.keys(rec).forEach((k) => headersSet.add(k));
    });
    const headers = Array.from(headersSet);

    function escapeHtml(val: any): string {
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    const ths = headers.map((h) => `    <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ccc;">${escapeHtml(h)}</th>`).join('\n');
    const rows = flattenedRecords
      .map((rec) => {
        const tds = headers.map((h) => `    <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(rec[h])}</td>`).join('\n');
        return `  <tr>\n${tds}\n  </tr>`;
      })
      .join('\n');

    const html = `<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">\n  <thead>\n  <tr>\n${ths}\n  </tr>\n  </thead>\n  <tbody>\n${rows}\n  </tbody>\n</table>`;

    return { result: html };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON object to URL-encoded query parameters (key1=value1&key2=value2).
 */
export function jsonToUrlEncoded(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) {
      return { result: input, error: 'JSON must be an object or array to encode as URL query string' };
    }

    const flat = flattenObject(parsed);
    const params = new URLSearchParams();

    for (const k of Object.keys(flat)) {
      const val = flat[k];
      if (val !== null && val !== undefined) {
        params.append(k, String(val));
      }
    }

    return { result: params.toString() };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts URL-encoded string or query parameters to JSON.
 */
export function urlEncodedToJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    let queryString = input.trim();

    // Extract query string from full URL (e.g. https://example.com/api?key=val)
    const qIdx = queryString.indexOf('?');
    if (qIdx !== -1 && /^https?:\/\//i.test(queryString)) {
      queryString = queryString.slice(qIdx + 1);
    }

    // Strip leading ? or # if copied directly from URL
    if (queryString.startsWith('?') || queryString.startsWith('#')) {
      queryString = queryString.slice(1);
    }

    const params = new URLSearchParams(queryString);
    const obj: Record<string, any> = {};

    params.forEach((value, key) => {
      if (obj[key] !== undefined) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]];
        }
        obj[key].push(parsePrimitive(value));
      } else {
        obj[key] = parsePrimitive(value);
      }
    });

    return { result: JSON.stringify(obj, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON object to Java .properties / .env format.
 */
export function jsonToProperties(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) {
      return { result: input, error: 'JSON must be an object or array' };
    }

    const flat = flattenObject(parsed);
    const lines: string[] = ['# Generated properties file'];

    for (const key of Object.keys(flat)) {
      const formattedKey = key.replace(/[^a-zA-Z0-9_.]/g, '_');
      const val = flat[key];
      const strVal = val === null || val === undefined ? '' : String(val);
      lines.push(`${formattedKey}=${strVal}`);
    }

    return { result: lines.join('\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts .properties or .env format into JSON.
 */
export function propertiesToJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    const lines = input.split(/\r?\n/);
    const obj: Record<string, any> = {};

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) return;

      const equalIndex = trimmed.indexOf('=');
      const colonIndex = trimmed.indexOf(':');

      let splitIdx = -1;
      if (equalIndex !== -1 && colonIndex !== -1) {
        splitIdx = Math.min(equalIndex, colonIndex);
      } else if (equalIndex !== -1) {
        splitIdx = equalIndex;
      } else if (colonIndex !== -1) {
        splitIdx = colonIndex;
      }

      if (splitIdx !== -1) {
        const key = trimmed.slice(0, splitIdx).trim();
        const rawVal = trimmed.slice(splitIdx + 1).trim();
        obj[key] = parsePrimitive(rawVal);
      }
    });

    return { result: JSON.stringify(obj, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Generates TypeScript type / interface definitions from JSON.
 */
export function jsonToTsInterface(input: string, rootName = 'RootObject'): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const interfaces: string[] = [];

    function getType(val: any, name: string): string {
      if (val === null || val === undefined) return 'any';

      const type = typeof val;
      if (type === 'boolean') return 'boolean';
      if (type === 'number') return 'number';
      if (type === 'string') return 'string';

      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        const elementType = getType(val[0], singularize(name));
        return `${elementType}[]`;
      }

      if (type === 'object') {
        const interfaceName = capitalize(name);
        const keys = Object.keys(val);

        const fields = keys.map((key) => {
          const fieldType = getType(val[key], key);
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
          return `  ${safeKey}: ${fieldType};`;
        });

        const code = `export interface ${interfaceName} {\n${fields.join('\n')}\n}`;
        interfaces.push(code);

        return interfaceName;
      }

      return 'any';
    }

    function capitalize(str: string): string {
      const cleaned = str.replace(/[^a-zA-Z0-9]/g, '');
      return (cleaned.charAt(0).toUpperCase() + cleaned.slice(1)) || 'Interface';
    }

    getType(parsed, rootName);

    // Deduplicate and return interfaces reversed (inner interfaces first)
    const uniqueInterfaces = Array.from(new Set(interfaces.reverse()));

    return { result: uniqueInterfaces.join('\n\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Parses a TOML value string, stripping surrounding quotes for string values.
 */
function parseTomlValue(rawVal: string): any {
  // Strip surrounding double or single quotes for TOML string values
  if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
    return rawVal.slice(1, -1);
  }
  // Handle TOML inline arrays: [1, 2, 3] or ["a", "b"]
  if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
    try {
      return JSON.parse(rawVal);
    } catch {
      // Fallback: split by comma and parse each element
      return rawVal.slice(1, -1).split(',').map((v) => parseTomlValue(v.trim()));
    }
  }
  return parsePrimitive(rawVal);
}

/**
 * Converts JSON to basic TOML format.
 */
export function jsonToToml(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);

    if (typeof parsed !== 'object' || parsed === null) {
      return { result: input, error: 'JSON must be an object' };
    }

    const tomlLines: string[] = ['# Generated TOML'];

    function formatTomlValue(val: any): string {
      if (val === null || val === undefined) return '""';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;
      if (Array.isArray(val)) return `[${val.map(formatTomlValue).join(', ')}]`;
      return `"${JSON.stringify(val).replace(/"/g, '\\"')}"`;
    }

    // Direct key-values first
    const objectEntries = Object.entries(parsed);
    const simpleEntries = objectEntries.filter(([, v]) => typeof v !== 'object' || v === null || Array.isArray(v));
    const tableEntries = objectEntries.filter(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v));

    simpleEntries.forEach(([k, v]) => {
      tomlLines.push(`${k} = ${formatTomlValue(v)}`);
    });

    tableEntries.forEach(([k, v]) => {
      tomlLines.push(`\n[${k}]`);
      if (typeof v === 'object' && v !== null) {
        Object.entries(v).forEach(([subK, subV]) => {
          tomlLines.push(`${subK} = ${formatTomlValue(subV)}`);
        });
      }
    });

    return { result: tomlLines.join('\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts TOML configuration strings to JSON.
 */
export function tomlToJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    const lines = input.split(/\r?\n/);
    const root: Record<string, any> = {};
    let currentTable = root;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('[') && line.endsWith(']')) {
        const tableName = line.slice(1, -1).trim();
        // Support dotted table names like [database.connection]
        const parts = tableName.split('.');
        let target: Record<string, any> = root;
        for (const part of parts) {
          target[part] = target[part] || {};
          target = target[part] as Record<string, any>;
        }
        currentTable = target;
        continue;
      }

      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        const rawVal = line.slice(eqIdx + 1).trim();
        currentTable[key] = parseTomlValue(rawVal);
      }
    }

    return { result: JSON.stringify(root, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON to Markdown Table.
 */
export function jsonToMarkdownTable(input: string): { result: string; error?: string } {
  try {
    let parsed = JSON.parse(input);
    if (!parsed) return { result: '', error: 'Empty JSON input' };
    if (!Array.isArray(parsed)) {
      if (typeof parsed === 'object') {
        parsed = [parsed];
      } else {
        return { result: '', error: 'JSON must be an array of objects for Markdown table conversion' };
      }
    }

    if (parsed.length === 0) {
      return { result: '| (empty) |\n| --- |' };
    }

    // Collect all unique keys
    const headers: string[] = Array.from(
      new Set(
        parsed.flatMap((item: any) => (typeof item === 'object' && item !== null ? Object.keys(item) : ['value']))
      )
    );

    if (headers.length === 0) headers.push('Value');

    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;

    const dataRows = parsed.map((item) => {
      if (typeof item !== 'object' || item === null) {
        return `| ${String(item)} |`;
      }
      const rec = item as Record<string, any>;
      return `| ${headers
        .map((h) => {
          const val = rec[h];
          if (val === undefined || val === null) return '';
          if (typeof val === 'object') return JSON.stringify(val).replace(/\|/g, '\\|');
          return String(val).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
        })
        .join(' | ')} |`;
    });

    return { result: [headerRow, separatorRow, ...dataRows].join('\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts Markdown table to JSON array of objects.
 */
export function markdownTableToJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith('|') && l.endsWith('|'));

    if (lines.length < 2) {
      return { result: input, error: 'Markdown table must contain at least a header row and a separator row' };
    }

    // Header row
    const headers = lines[0]
      .slice(1, -1)
      .split('|')
      .map((h) => h.trim());

    // Skip separator row (index 1) if it contains dashes
    const startIdx = lines[1].includes('---') ? 2 : 1;

    const items: Record<string, any>[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cells = lines[i]
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim().replace(/<br>/gi, '\n'));

      const rowObj: Record<string, any> = {};
      headers.forEach((h, colIdx) => {
        const rawCell = cells[colIdx] || '';
        rowObj[h] = parsePrimitive(rawCell);
      });
      items.push(rowObj);
    }

    return { result: JSON.stringify(items, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON array to NDJSON (Newline Delimited JSON).
 */
export function jsonToNdjson(input: string): { result: string; error?: string } {
  try {
    let parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }
    const lines = parsed.map((item) => JSON.stringify(item));
    return { result: lines.join('\n') };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts NDJSON (Newline Delimited JSON) to JSON array.
 */
export function ndjsonToJson(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedArray = lines.map((line) => JSON.parse(line));
    return { result: JSON.stringify(parsedArray, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON to Python Dict literal syntax.
 */
export function jsonToPythonDict(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);

    function formatPy(val: any, level = 0): string {
      const indentStr = '    '.repeat(level);
      const childIndentStr = '    '.repeat(level + 1);

      if (val === null) return 'None';
      if (val === true) return 'True';
      if (val === false) return 'False';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') return `"${val.replace(/"/g, '\\"')}"`;

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        const items = val.map((v) => `${childIndentStr}${formatPy(v, level + 1)}`).join(',\n');
        return `[\n${items}\n${indentStr}]`;
      }

      if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length === 0) return '{}';
        const entries = keys
          .map((k) => `${childIndentStr}"${k}": ${formatPy(val[k], level + 1)}`)
          .join(',\n');
        return `{\n${entries}\n${indentStr}}`;
      }

      return 'None';
    }

    return { result: formatPy(parsed) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Converts JSON to PHP Array syntax.
 */
export function jsonToPhpArray(input: string): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);

    function formatPhp(val: any, level = 0): string {
      const indentStr = '    '.repeat(level);
      const childIndentStr = '    '.repeat(level + 1);

      if (val === null) return 'null';
      if (val === true) return 'true';
      if (val === false) return 'false';
      if (typeof val === 'number') return String(val);
      if (typeof val === 'string') return `'${val.replace(/'/g, "\\'")}'`;

      if (Array.isArray(val)) {
        if (val.length === 0) return '[]';
        const items = val.map((v) => `${childIndentStr}${formatPhp(v, level + 1)}`).join(',\n');
        return `[\n${items}\n${indentStr}]`;
      }

      if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length === 0) return '[]';
        const entries = keys
          .map((k) => `${childIndentStr}'${k}' => ${formatPhp(val[k], level + 1)}`)
          .join(',\n');
        return `[\n${entries}\n${indentStr}]`;
      }

      return 'null';
    }

    return { result: `$data = ${formatPhp(parsed)};` };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Universal Cross-Format Converter.
 * Parses input from any format into JS Object, then converts to target format.
 */
export function convertAnyFormat(
  input: string,
  fromFormat: string,
  toFormat: string,
  options: {
    indent?: string | number;
    csvOptions?: CsvOptions;
    xmlOptions?: XmlOptions;
    sqlOptions?: SqlOptions;
  } = {}
): { result: string; error?: string; parsed?: any } {
  const indent = options.indent || 2;
  const space = indent === 'tab' ? '\t' : Number(indent) || 2;

  // Step 1: Parse input into JS Object/Array
  let parsed: any = null;
  let parseError = '';

  if (!input || !input.trim()) {
    return { result: '' };
  }

  try {
    if (fromFormat === 'json') {
      parsed = JSON.parse(input);
    } else if (fromFormat === 'xml') {
      parsed = xmlToJson(input);
    } else if (fromFormat === 'csv') {
      parsed = csvToJson(input, options.csvOptions);
    } else if (fromFormat === 'toml') {
      const res = tomlToJson(input);
      if (res.error) parseError = res.error;
      else parsed = JSON.parse(res.result);
    } else if (fromFormat === 'properties') {
      const res = propertiesToJson(input);
      if (res.error) parseError = res.error;
      else parsed = JSON.parse(res.result);
    } else if (fromFormat === 'urlencoded') {
      const res = urlEncodedToJson(input);
      parsed = JSON.parse(res.result);
    } else if (fromFormat === 'ndjson') {
      const res = ndjsonToJson(input);
      if (res.error) parseError = res.error;
      else parsed = JSON.parse(res.result);
    } else if (fromFormat === 'sql') {
      const res = sqlToJson(input);
      if (res.error) parseError = res.error;
      else parsed = JSON.parse(res.result);
    } else if (fromFormat === 'markdown') {
      const res = markdownTableToJson(input);
      if (res.error) parseError = res.error;
      else parsed = JSON.parse(res.result);
    } else if (fromFormat === 'yaml') {
      // Basic YAML / JSON parse
      try {
        parsed = JSON.parse(input);
      } catch {
        // Simple fallback key-value parse if plain YAML
        const lines = input.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
        const obj: Record<string, any> = {};
        lines.forEach((l) => {
          const idx = l.indexOf(':');
          if (idx !== -1) {
            const k = l.slice(0, idx).trim();
            const v = l.slice(idx + 1).trim();
            obj[k] = parsePrimitive(v);
          }
        });
        parsed = obj;
      }
    } else {
      parsed = JSON.parse(input);
    }
  } catch (err: any) {
    parseError = err.message || 'Failed to parse input data';
  }

  if (parseError) {
    return { result: input, error: parseError };
  }

  // Step 2: Convert parsed object to target format
  const jsonStr = JSON.stringify(parsed, null, space);

  if (toFormat === 'json') {
    return { result: jsonStr, parsed };
  } else if (toFormat === 'xml') {
    const res = jsonToXml(parsed, options.xmlOptions);
    return { result: res, parsed };
  } else if (toFormat === 'csv') {
    const res = jsonToCsv(parsed, options.csvOptions);
    return { result: res, parsed };
  } else if (toFormat === 'yaml') {
    const res = jsonToYaml(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'toml') {
    const res = jsonToToml(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'sql') {
    const res = jsonToSql(jsonStr, options.sqlOptions);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'html') {
    const res = jsonToHtmlTable(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'markdown') {
    const res = jsonToMarkdownTable(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'urlencoded') {
    const res = jsonToUrlEncoded(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'properties') {
    const res = jsonToProperties(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'ts-interface') {
    const res = jsonToTsInterface(jsonStr, 'RootObject');
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'ndjson') {
    const res = jsonToNdjson(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'python') {
    const res = jsonToPythonDict(jsonStr);
    return { result: res.result, error: res.error, parsed };
  } else if (toFormat === 'php') {
    const res = jsonToPhpArray(jsonStr);
    return { result: res.result, error: res.error, parsed };
  }

  return { result: jsonStr, parsed };
}


/**
 * Converts object keys across nested JSON structures to specified casing format.
 */
export function convertKeyCase(
  input: string,
  caseStyle: 'camel' | 'snake' | 'kebab' | 'pascal' | 'constant',
  indent: string | number = 2
): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    function formatKey(key: string): string {
      // Split by underscores, hyphens, or camelCase boundaries
      const words = key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_\-]/g, ' ')
        .trim()
        .split(/\s+/);

      if (words.length === 0 || !words[0]) return key;

      if (caseStyle === 'camel') {
        return words
          .map((w, idx) =>
            idx === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
          .join('');
      }
      if (caseStyle === 'snake') {
        return words.map((w) => w.toLowerCase()).join('_');
      }
      if (caseStyle === 'kebab') {
        return words.map((w) => w.toLowerCase()).join('-');
      }
      if (caseStyle === 'pascal') {
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      }
      if (caseStyle === 'constant') {
        return words.map((w) => w.toUpperCase()).join('_');
      }
      return key;
    }

    function transform(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(transform);
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          newObj[formatKey(k)] = transform(v);
        }
        return newObj;
      }
      return obj;
    }

    const resultObj = transform(parsed);
    return { result: JSON.stringify(resultObj, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}

/**
 * Redacts or masks sensitive PII fields in JSON structures.
 */
export function maskSensitiveData(
  input: string,
  customKeys: string[] = [],
  maskText = '***REDACTED***',
  indent: string | number = 2
): { result: string; maskedCount: number; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    const defaultSensitivePatterns = [
      'password',
      'pass',
      'secret',
      'token',
      'bearer',
      'ssn',
      'socialsecurity',
      'creditcard',
      'cardnumber',
      'cvv',
      'cvc',
      'apikey',
      'api_key',
      'privatekey',
      'auth',
      'access_token',
      'refresh_token',
      'email',
      'mail',
      'phone',
      'mobile',
    ];

    const allKeys = Array.from(
      new Set([...defaultSensitivePatterns, ...customKeys.map((k) => k.toLowerCase())])
    );

    let maskedCount = 0;

    function isSensitive(key: string): boolean {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      return allKeys.some((pattern) => cleanKey.includes(pattern));
    }

    function redact(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(redact);
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (isSensitive(k) && typeof v !== 'object') {
            newObj[k] = maskText;
            maskedCount++;
          } else {
            newObj[k] = redact(v);
          }
        }
        return newObj;
      }
      return obj;
    }

    const redactedObj = redact(parsed);
    return { result: JSON.stringify(redactedObj, null, space), maskedCount };
  } catch (err: any) {
    return { result: input, maskedCount: 0, error: err.message };
  }
}

/**
 * Queries JSON data using simple dot-notation / array path queries.
 * Examples: 'users[0].name', '$.data.items[*].id', 'config.settings'
 */
export function queryJsonPath(
  input: string,
  pathQuery: string,
  indent: string | number = 2
): { result: string; matchesCount: number; error?: string } {
  if (!pathQuery || !pathQuery.trim()) {
    return { result: input, matchesCount: 1 };
  }

  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    // Clean leading $ or $.
    let cleanQuery = pathQuery.trim();
    if (cleanQuery.startsWith('$.')) cleanQuery = cleanQuery.slice(2);
    else if (cleanQuery.startsWith('$')) cleanQuery = cleanQuery.slice(1);

    if (!cleanQuery) {
      return { result: JSON.stringify(parsed, null, space), matchesCount: 1 };
    }

    // Tokenize query path (e.g. users[0].name -> ['users', 0, 'name'])
    const tokens: (string | number)[] = [];
    const parts = cleanQuery.split('.');

    for (const part of parts) {
      const arrayMatch = part.match(/^([a-zA-Z0-9_$]+)?\[(\d+|\*)\]$/);
      if (arrayMatch) {
        if (arrayMatch[1]) tokens.push(arrayMatch[1]);
        tokens.push(arrayMatch[2] === '*' ? '*' : Number(arrayMatch[2]));
      } else {
        tokens.push(part);
      }
    }

    let currentNodes: any[] = [parsed];

    for (const token of tokens) {
      const nextNodes: any[] = [];

      for (const node of currentNodes) {
        if (node === null || node === undefined) continue;

        if (token === '*') {
          if (Array.isArray(node)) {
            nextNodes.push(...node);
          } else if (typeof node === 'object') {
            nextNodes.push(...Object.values(node));
          }
        } else if (typeof token === 'number') {
          if (Array.isArray(node) && node[token] !== undefined) {
            nextNodes.push(node[token]);
          }
        } else if (typeof token === 'string') {
          if (typeof node === 'object' && node[token] !== undefined) {
            nextNodes.push(node[token]);
          }
        }
      }

      currentNodes = nextNodes;
    }

    const outputData = currentNodes.length === 1 ? currentNodes[0] : currentNodes;
    return {
      result: JSON.stringify(outputData, null, space),
      matchesCount: currentNodes.length,
    };
  } catch (err: any) {
    return { result: input, matchesCount: 0, error: err.message };
  }
}

export interface JsonDiffResult {
  addedKeys: string[];
  removedKeys: string[];
  modifiedKeys: { path: string; valA: any; valB: any }[];
  same: boolean;
  summary: string;
}

/**
 * Calculates visual structured difference between two JSON inputs.
 */
export function diffJsonObjects(jsonAStr: string, jsonBStr: string): JsonDiffResult {
  try {
    const objA = JSON.parse(jsonAStr);
    const objB = JSON.parse(jsonBStr);

    const added: string[] = [];
    const removed: string[] = [];
    const modified: { path: string; valA: any; valB: any }[] = [];

    function compare(a: any, b: any, currentPath: string) {
      if (typeof a !== typeof b) {
        modified.push({ path: currentPath, valA: a, valB: b });
        return;
      }

      if (a === null || b === null || typeof a !== 'object') {
        if (a !== b) {
          modified.push({ path: currentPath, valA: a, valB: b });
        }
        return;
      }

      if (Array.isArray(a) !== Array.isArray(b)) {
        modified.push({ path: currentPath, valA: a, valB: b });
        return;
      }

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      const allKeys = Array.from(new Set([...keysA, ...keysB]));

      for (const k of allKeys) {
        const nextPath = currentPath ? `${currentPath}.${k}` : k;
        const hasA = k in a;
        const hasB = k in b;

        if (hasA && !hasB) {
          removed.push(nextPath);
        } else if (!hasA && hasB) {
          added.push(nextPath);
        } else {
          compare(a[k], b[k], nextPath);
        }
      }
    }

    compare(objA, objB, '');

    const totalDiffs = added.length + removed.length + modified.length;
    const same = totalDiffs === 0;

    return {
      addedKeys: added,
      removedKeys: removed,
      modifiedKeys: modified,
      same,
      summary: same
        ? 'JSON objects are identical'
        : `Found ${totalDiffs} differences (${added.length} added, ${removed.length} removed, ${modified.length} modified)`,
    };
  } catch (err: any) {
    return {
      addedKeys: [],
      removedKeys: [],
      modifiedKeys: [],
      same: false,
      summary: `Invalid JSON comparison: ${err.message}`,
    };
  }
}

/**
 * Removes duplicate items from a JSON array.
 */
export function deduplicateJsonArray(input: string, indent: string | number = 2): { result: string; count: number; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    if (!Array.isArray(parsed)) {
      return { result: input, count: 0, error: 'Input must be a JSON array to deduplicate' };
    }

    const seen = new Set<string>();
    const deduplicated: any[] = [];

    for (const item of parsed) {
      const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    const removedCount = parsed.length - deduplicated.length;
    return {
      result: JSON.stringify(deduplicated, null, space),
      count: removedCount,
    };
  } catch (err: any) {
    return { result: input, count: 0, error: err.message };
  }
}

/**
 * Flattens nested multi-dimensional arrays into a single-level array.
 */
export function flattenNestedArray(input: string, indent: string | number = 2): { result: string; error?: string } {
  try {
    const parsed = JSON.parse(input);
    const space = indent === 'tab' ? '\t' : Number(indent) || 2;

    if (!Array.isArray(parsed)) {
      return { result: input, error: 'Input must be a JSON array to flatten' };
    }

    function flattenDeep(arr: any[]): any[] {
      return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)), []);
    }

    const flat = flattenDeep(parsed);
    return { result: JSON.stringify(flat, null, space) };
  } catch (err: any) {
    return { result: input, error: err.message };
  }
}


