import { describe, expect, it } from 'vitest';
import { applyMergePatch, createMergePatch } from '../jsonPatchEngine';

describe('JSON merge patch safety and round trips', () => {
  it('treats prototype-related keys as JSON data without changing global prototypes', () => {
    const patch = '{"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}';
    const result = applyMergePatch('{}', patch);
    expect(result.error).toBeUndefined();
    expect(Object.prototype).not.toHaveProperty('polluted');
    expect(Object.getPrototypeOf(result.resultDocument)).toBe(Object.prototype);
    expect(JSON.parse(result.resultString)).toEqual(JSON.parse(patch));
  });

  it('generates patches for own keys even when their names exist on Object.prototype', () => {
    const target = '{"__proto__":{"value":1},"toString":"data"}';
    const patch = createMergePatch('{}', target);
    expect(patch.error).toBeUndefined();
    expect(JSON.parse(patch.patchString)).toEqual(JSON.parse(target));
    expect(JSON.parse(applyMergePatch('{}', patch.patchString).resultString)).toEqual(JSON.parse(target));
  });

  it.each(['1', 'null', '[1,2]', '"value"'])('emits valid JSON for unchanged %s', (document) => {
    const patch = createMergePatch(document, document);
    expect(patch.error).toBeUndefined();
    const result = applyMergePatch(document, patch.patchString);
    expect(result.error).toBeUndefined();
    expect(JSON.parse(result.resultString)).toEqual(JSON.parse(document));
  });
});
