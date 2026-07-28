import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHistory, getUserPreferences } from '../storage';

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});

describe('local preference and history recovery', () => {
  it('deep-merges older partial preferences with current defaults', () => {
    values.set(
      'json_formatter_prefs_v1',
      JSON.stringify({
        indent: '4',
        csvOptions: { delimiter: ';' },
        sqlOptions: { dialect: 'postgres' },
      })
    );

    const preferences = getUserPreferences();

    expect(preferences.indent).toBe('4');
    expect(preferences.csvOptions).toEqual({
      delimiter: ';',
      header: true,
      flattenNested: true,
    });
    expect(preferences.sqlOptions.dialect).toBe('postgres');
    expect(preferences.sqlOptions.tableName).toBe('records');
    expect(preferences.xmlOptions.rootName).toBe('root');
  });

  it('ignores malformed history entries without discarding valid entries', () => {
    values.set(
      'json_formatter_history_v1',
      JSON.stringify([
        { id: 'broken' },
        {
          id: 'valid',
          timestamp: 1,
          title: 'Formatted JSON',
          inputFormat: 'json',
          outputFormat: 'json',
          inputText: '{}',
          outputText: '{}',
          inputSizeBytes: 2,
          outputSizeBytes: 2,
          valid: true,
        },
      ])
    );

    expect(getHistory().map((item) => item.id)).toEqual(['valid']);
  });
});
