import { describe, it, expect } from 'vitest';
import {
  repairJson,
  minifyJson,
  formatJson,
  generateJsonSchema,
  deduplicateJsonArray,
  flattenNestedArray,
  detectFormat,
} from '../jsonUtils';

describe('JSON Utilities & Auto-Repair Engine', () => {
  it('should repair dirty JSON with single quotes, unquoted keys, and python booleans', () => {
    const dirty = `{name: 'John', age: 30, active: True, roles: ['admin',]}`;
    const { repaired, fixed } = repairJson(dirty);

    expect(fixed).toBe(true);
    const parsed = JSON.parse(repaired);
    expect(parsed.name).toBe('John');
    expect(parsed.active).toBe(true);
    expect(parsed.roles).toEqual(['admin']);
  });

  it('should minify valid JSON', () => {
    const raw = `{\n  "a": 1,\n  "b": 2\n}`;
    const { result } = minifyJson(raw);
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('should format JSON with custom indentation', () => {
    const raw = '{"a":1}';
    const { result } = formatJson(raw, 2);
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('should generate JSON Schema from multi-item array with required vs optional keys', () => {
    const arrayInput = JSON.stringify([
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob' },
    ]);

    const { result } = generateJsonSchema(arrayInput, 2);
    const schema = JSON.parse(result);

    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    expect(schema.type).toBe('array');
    expect(schema.items.properties.id).toBeDefined();
    expect(schema.items.properties.name).toBeDefined();
    expect(schema.items.properties.role).toBeDefined();
    expect(schema.items.required).toContain('id');
    expect(schema.items.required).toContain('name');
    expect(schema.items.required).not.toContain('role');
  });

  it('should deduplicate primitive and object elements in array', () => {
    const arrayInput = JSON.stringify([1, 2, 2, 3, { a: 1 }, { a: 1 }]);
    const { result, count } = deduplicateJsonArray(arrayInput);

    expect(count).toBe(2);
    expect(JSON.parse(result)).toHaveLength(4);
  });

  it('should flatten nested multi-dimensional arrays', () => {
    const nested = JSON.stringify([1, [2, [3, 4]], 5]);
    const { result } = flattenNestedArray(nested);

    expect(JSON.parse(result)).toEqual([1, 2, 3, 4, 5]);
  });

  it('detects explicit JSON5, dotenv, HCL, and properties syntax', () => {
    expect(detectFormat('{user: "Ada", // comment\n active: true,}')).toBe('json5');
    expect(detectFormat('export API_KEY=secret\nPORT=3000')).toBe('env');
    expect(detectFormat('resource "server" "api" {\n  enabled = true\n}')).toBe('hcl');
    expect(detectFormat('app.name=JSON Studio\napp.port=3000')).toBe('properties');
  });
});
