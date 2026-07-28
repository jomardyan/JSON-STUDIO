import { describe, expect, it } from 'vitest';
import {
  convertFormat,
  detectFormatFromFilename,
  getConversionCompatibility,
  getFileExtensionForFormat,
  getFormatAdapter,
  listFormatAdapters,
} from '../formatRegistry';

describe('Format Adapter Registry', () => {
  it('registers a single source of truth for all 18 formats', () => {
    const adapters = listFormatAdapters();
    expect(adapters).toHaveLength(18);
    expect(new Set(adapters.map((adapter) => adapter.id)).size).toBe(adapters.length);
    expect(getFormatAdapter('typescript')?.id).toBe('ts-interface');
    expect(getFormatAdapter('jsonc')?.id).toBe('json5');
  });

  it('deduces extensions and source formats without title-specific duplication', () => {
    expect(getFileExtensionForFormat('json')).toBe('.json');
    expect(getFileExtensionForFormat('JSON to CSV')).toBe('.csv');
    expect(getFileExtensionForFormat('JSON to Dotenv Environment')).toBe('.env');
    expect(getFileExtensionForFormat('JSON Schema')).toBe('.schema.json');
    expect(detectFormatFromFilename('settings.JSONC')).toBe('json5');
    expect(detectFormatFromFilename('terraform.tf')).toBe('hcl');
    expect(detectFormatFromFilename('records.jsonl')).toBe('ndjson');
  });

  it('performs normalized conversion between registered formats', () => {
    const input = JSON.stringify([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
    const result = convertFormat(input, 'json', 'csv');

    expect(result.valid).toBe(true);
    expect(result.outputText).toContain('id,name');
    expect(result.outputText).toContain('1,Alice');
    expect(result.outputText).toContain('2,Bob');
    expect(result.warnings.map((warning) => warning.code)).toContain('PARTIAL_TARGET_SUPPORT');
  });

  it('does not silently fall back to JSON for unknown formats', () => {
    const result = convertFormat('{"ok":true}', 'unknown-format', 'json');
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Unsupported format');
  });

  it('blocks output-only adapters from being used as source formats', () => {
    const result = convertFormat('interface User { id: number }', 'typescript', 'json');
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('output-only');
  });

  it('reports actual data-loss risks for nested and typed values', () => {
    const result = convertFormat(
      JSON.stringify({ database: { host: 'localhost', port: 5432 }, enabled: true }),
      'json',
      'env'
    );

    expect(result.valid).toBe(true);
    expect(result.isLossy).toBe(true);
    expect(result.warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(['DATA_LOSS_NESTED_OBJECTS', 'DATA_LOSS_TYPES'])
    );
  });

  it('supports reverse Markdown table parsing through the shared adapter', () => {
    const markdown = '| id | name |\n| --- | --- |\n| 1 | Alice |';
    const result = convertFormat(markdown, 'markdown', 'json');

    expect(result.valid).toBe(true);
    expect(JSON.parse(result.outputText)).toEqual([{ id: 1, name: 'Alice' }]);
  });

  it('round-trips nested YAML through the same adapter used by the UI', () => {
    const source = {
      service: {
        name: 'api',
        ports: [8080, 8081],
        environment: { enabled: true, region: 'eu-central' },
      },
    };

    const yaml = convertFormat(JSON.stringify(source), 'json', 'yaml');
    const restored = convertFormat(yaml.outputText, 'yaml', 'json');

    expect(yaml.valid).toBe(true);
    expect(restored.valid).toBe(true);
    expect(JSON.parse(restored.outputText)).toEqual(source);
  });

  it('passes user serialization preferences through the registry', () => {
    const result = convertFormat(
      JSON.stringify([{ id: 1, name: 'Alice' }]),
      'json',
      'csv',
      2,
      {
        csvOptions: {
          delimiter: ';',
          header: true,
          flattenNested: true,
        },
      }
    );

    expect(result.valid).toBe(true);
    expect(result.outputText).toContain('id;name');
  });

  it('honors headerless CSV parsing and nested-object serialization preferences', () => {
    const headerless = convertFormat('1;Alice\n2;Bob', 'csv', 'json', 2, {
      csvOptions: { delimiter: ';', header: false, flattenNested: false },
    });
    const unflattened = convertFormat(
      JSON.stringify([{ id: 1, profile: { role: 'admin' } }]),
      'json',
      'csv',
      2,
      {
        csvOptions: { delimiter: ',', header: true, flattenNested: false },
      }
    );

    expect(JSON.parse(headerless.outputText)).toEqual([
      { col_1: 1, col_2: 'Alice' },
      { col_1: 2, col_2: 'Bob' },
    ]);
    expect(unflattened.outputText).toContain('profile');
    expect(unflattened.outputText).toContain('"{""role"":""admin""}"');
    expect(unflattened.outputText).not.toContain('profile.role');
  });

  it('derives matrix status from adapter direction and capabilities', () => {
    expect(getConversionCompatibility('typescript', 'json').status).toBe('none');
    expect(getConversionCompatibility('json', 'env').status).toBe('lossy');
    expect(getConversionCompatibility('json', 'ndjson').status).toBe('supported');
    expect(getConversionCompatibility('json5', 'json').status).toBe('partial');
  });
});
