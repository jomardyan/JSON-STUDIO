/**
 * JSON Charting & Analytics Utility
 * Converts JSON objects/arrays into series data for Recharts visualization.
 */

export interface ChartFieldInfo {
  key: string;
  type: 'number' | 'string' | 'boolean' | 'date';
  sampleValue: any;
}

export interface ChartAnalysisResult {
  records: Record<string, any>[];
  numericKeys: string[];
  categoryKeys: string[];
  defaultXKey: string;
  defaultYKeys: string[];
}

export function analyzeJsonForCharts(data: any): ChartAnalysisResult {
  let records: Record<string, any>[] = [];

  if (Array.isArray(data)) {
    records = data.filter((item) => typeof item === 'object' && item !== null);
  } else if (typeof data === 'object' && data !== null) {
    // Look for first array property
    const arrayProp = Object.values(data).find((v) => Array.isArray(v));
    if (arrayProp && Array.isArray(arrayProp)) {
      records = arrayProp.filter((item) => typeof item === 'object' && item !== null);
    } else {
      records = [data];
    }
  }

  if (records.length === 0) {
    return {
      records: [],
      numericKeys: [],
      categoryKeys: [],
      defaultXKey: '',
      defaultYKeys: [],
    };
  }

  const keyMap: Map<string, 'number' | 'string' | 'boolean' | 'date'> = new Map();

  records.forEach((rec) => {
    Object.entries(rec).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      if (typeof v === 'number') {
        keyMap.set(k, 'number');
      } else if (typeof v === 'string') {
        if (!keyMap.has(k)) keyMap.set(k, 'string');
      } else if (typeof v === 'boolean') {
        if (!keyMap.has(k)) keyMap.set(k, 'boolean');
      }
    });
  });

  const numericKeys: string[] = [];
  const categoryKeys: string[] = [];

  keyMap.forEach((type, key) => {
    if (type === 'number') {
      numericKeys.push(key);
    } else {
      categoryKeys.push(key);
    }
  });

  const defaultXKey =
    categoryKeys.find((k) => /name|title|id|label|date|category|day|month|user|sku/i.test(k)) ||
    categoryKeys[0] ||
    'index';

  const defaultYKeys = numericKeys.slice(0, 3);

  // Flatten nested objects for chart rendering if needed
  const normalizedRecords = records.map((rec, idx) => {
    const flat: Record<string, any> = { index: idx + 1 };
    Object.entries(rec).forEach(([k, v]) => {
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        Object.entries(v).forEach(([subK, subV]) => {
          flat[`${k}.${subK}`] = subV;
        });
      } else {
        flat[k] = v;
      }
    });
    return flat;
  });

  return {
    records: normalizedRecords,
    numericKeys,
    categoryKeys,
    defaultXKey,
    defaultYKeys,
  };
}
