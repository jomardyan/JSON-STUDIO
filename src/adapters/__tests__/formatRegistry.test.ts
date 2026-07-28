import { describe, it, expect } from 'vitest';
import {
  getFormatAdapter,
  getFileExtensionForFormat,
  convertFormat,
} from '../formatRegistry';

describe('Format Adapter Registry', () => {
  it('should retrieve format adapters for supported formats', () => {
    const jsonAdapter = getFormatAdapter('json');
    expect(jsonAdapter).not.toBeNull();
    expect(jsonAdapter?.name).toBe('JSON');
    expect(jsonAdapter?.extensions).toContain('.json');

    const csvAdapter = getFormatAdapter('csv');
    expect(csvAdapter).not.toBeNull();
    expect(csvAdapter?.extensions).toContain('.csv');
  });

  it('should deduce correct file extensions for formats and action titles', () => {
    expect(getFileExtensionForFormat('json')).toBe('.json');
    expect(getFileExtensionForFormat('JSON to CSV')).toBe('.csv');
    expect(getFileExtensionForFormat('JSON to XML')).toBe('.xml');
    expect(getFileExtensionForFormat('JSON to YAML')).toBe('.yml');
    expect(getFileExtensionForFormat('JSON to SQL')).toBe('.sql');
    expect(getFileExtensionForFormat('JSON to TOML')).toBe('.toml');
    expect(getFileExtensionForFormat('JSON to TypeScript')).toBe('.ts');
  });

  it('should perform normalized conversion between formats', () => {
    const jsonInput = JSON.stringify([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    const result = convertFormat(jsonInput, 'json', 'csv');

    expect(result.valid).toBe(true);
    expect(result.outputText).toContain('id,name');
    expect(result.outputText).toContain('1,Alice');
    expect(result.outputText).toContain('2,Bob');
  });
});
