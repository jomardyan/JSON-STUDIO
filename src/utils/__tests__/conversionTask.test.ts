import { describe, expect, it } from 'vitest';
import { executeConversionTask } from '../conversionTask';

describe('Conversion task executor', () => {
  it('executes registry conversions and returns warnings', () => {
    const result = executeConversionTask({
      id: 'convert-1',
      type: 'convert',
      input: JSON.stringify({ nested: { value: 1 } }),
      sourceFormat: 'json',
      targetFormat: 'env',
    });

    expect(result.success).toBe(true);
    expect(result.result).toContain('NESTED_VALUE=1');
    expect(result.isLossy).toBe(true);
    expect(result.warnings?.length).toBeGreaterThan(0);
  });

  it('returns a failed result instead of throwing for malformed input', () => {
    const result = executeConversionTask({
      id: 'convert-2',
      type: 'convert',
      input: '{bad json',
      sourceFormat: 'json',
      targetFormat: 'yaml',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('formats, minifies, repairs, and generates schemas through one task API', () => {
    const formatted = executeConversionTask({
      id: 'format-1',
      type: 'format',
      input: '{"a":1}',
      indent: 2,
    });
    const minified = executeConversionTask({
      id: 'minify-1',
      type: 'minify',
      input: '{\n  "a": 1\n}',
    });
    const repaired = executeConversionTask({
      id: 'repair-1',
      type: 'repair',
      input: "{name: 'Alice', active: True,}",
    });
    const schema = executeConversionTask({
      id: 'schema-1',
      type: 'schema',
      input: '[{"id":1},{"id":2,"name":"Alice"}]',
    });

    expect(formatted.result).toBe('{\n  "a": 1\n}');
    expect(minified.result).toBe('{"a":1}');
    expect(repaired.success).toBe(true);
    expect(JSON.parse(repaired.result || '{}')).toEqual({ name: 'Alice', active: true });
    expect(schema.success).toBe(true);
    expect(JSON.parse(schema.result || '{}').type).toBe('array');
  });
});
