/**
 * JSON Payload Profiler & Structural Inspector
 * Calculates depth, key counts, data type size distribution, array metrics, etc.
 */

export interface TypeByteBreakdown {
  type: string;
  count: number;
  estimatedBytes: number;
  percentage: number;
  color: string;
}

export interface ArrayMetric {
  path: string;
  length: number;
  elementType: string;
}

export interface KeyFrequency {
  key: string;
  count: number;
}

export interface JsonProfileReport {
  totalBytes: number;
  formattedBytes: number;
  minifiedBytes: number;
  totalKeys: number;
  uniqueKeysCount: number;
  maxDepth: number;
  totalPrimitiveValues: number;
  totalObjects: number;
  totalArrays: number;
  typeBreakdown: TypeByteBreakdown[];
  topArrays: ArrayMetric[];
  frequentKeys: KeyFrequency[];
  rootType: string;
  error?: string;
}

export function profileJsonPayload(jsonString: string): JsonProfileReport {
  const emptyReport: JsonProfileReport = {
    totalBytes: 0,
    formattedBytes: 0,
    minifiedBytes: 0,
    totalKeys: 0,
    uniqueKeysCount: 0,
    maxDepth: 0,
    totalPrimitiveValues: 0,
    totalObjects: 0,
    totalArrays: 0,
    typeBreakdown: [],
    topArrays: [],
    frequentKeys: [],
    rootType: 'unknown',
  };

  if (!jsonString || !jsonString.trim()) {
    return { ...emptyReport, error: 'JSON string is empty' };
  }

  try {
    const rawBytes = new Blob([jsonString]).size;
    const parsed = JSON.parse(jsonString);
    const minifiedStr = JSON.stringify(parsed);
    const formattedStr = JSON.stringify(parsed, null, 2);

    const minifiedBytes = new Blob([minifiedStr]).size;
    const formattedBytes = new Blob([formattedStr]).size;

    let totalKeys = 0;
    let maxDepth = 0;
    let totalPrimitiveValues = 0;
    let totalObjects = 0;
    let totalArrays = 0;

    const keyCounts: Record<string, number> = {};
    const arrayMetrics: ArrayMetric[] = [];

    const typeBytesMap: Record<string, { count: number; bytes: number }> = {
      string: { count: 0, bytes: 0 },
      number: { count: 0, bytes: 0 },
      boolean: { count: 0, bytes: 0 },
      null: { count: 0, bytes: 0 },
      object: { count: 0, bytes: 0 },
      array: { count: 0, bytes: 0 },
    };

    function traverse(val: any, currentDepth: number, currentPath: string) {
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }

      if (val === null) {
        typeBytesMap.null.count += 1;
        typeBytesMap.null.bytes += 4;
        totalPrimitiveValues += 1;
        return;
      }

      const t = typeof val;

      if (t === 'boolean') {
        typeBytesMap.boolean.count += 1;
        typeBytesMap.boolean.bytes += val ? 4 : 5;
        totalPrimitiveValues += 1;
        return;
      }

      if (t === 'number') {
        typeBytesMap.number.count += 1;
        typeBytesMap.number.bytes += String(val).length;
        totalPrimitiveValues += 1;
        return;
      }

      if (t === 'string') {
        typeBytesMap.string.count += 1;
        typeBytesMap.string.bytes += new Blob([val]).size;
        totalPrimitiveValues += 1;
        return;
      }

      if (Array.isArray(val)) {
        totalArrays += 1;
        typeBytesMap.array.count += 1;
        typeBytesMap.array.bytes += 2; // []

        let elemType = 'empty';
        if (val.length > 0) {
          elemType = val[0] === null ? 'null' : typeof val[0];
          if (elemType === 'object' && Array.isArray(val[0])) elemType = 'array';
        }

        arrayMetrics.push({
          path: currentPath || 'root',
          length: val.length,
          elementType: elemType,
        });

        for (let i = 0; i < val.length; i++) {
          traverse(val[i], currentDepth + 1, `${currentPath}[${i}]`);
        }
        return;
      }

      if (t === 'object') {
        totalObjects += 1;
        typeBytesMap.object.count += 1;
        typeBytesMap.object.bytes += 2; // {}

        for (const k of Object.keys(val)) {
          totalKeys += 1;
          keyCounts[k] = (keyCounts[k] || 0) + 1;
          const childPath = currentPath ? `${currentPath}.${k}` : k;
          traverse(val[k], currentDepth + 1, childPath);
        }
        return;
      }
    }

    const rootType = Array.isArray(parsed) ? 'array' : typeof parsed;
    traverse(parsed, 1, '$');

    // Type breakdown percentage calculation
    const totalCalcBytes = Object.values(typeBytesMap).reduce((acc, curr) => acc + curr.bytes, 0) || 1;

    const colorsMap: Record<string, string> = {
      string: '#10b981', // emerald
      number: '#3b82f6', // blue
      boolean: '#f59e0b', // amber
      null: '#ef4444', // rose
      object: '#8b5cf6', // purple
      array: '#06b6d4', // cyan
    };

    const typeBreakdown: TypeByteBreakdown[] = Object.entries(typeBytesMap)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        estimatedBytes: stats.bytes,
        percentage: Math.round((stats.bytes / totalCalcBytes) * 100),
        color: colorsMap[type] || '#6b7280',
      }))
      .filter((item) => item.count > 0);

    // Top frequent keys
    const frequentKeys: KeyFrequency[] = Object.entries(keyCounts)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top array lengths
    const topArrays = arrayMetrics.sort((a, b) => b.length - a.length).slice(0, 8);

    return {
      totalBytes: rawBytes,
      formattedBytes,
      minifiedBytes,
      totalKeys,
      uniqueKeysCount: Object.keys(keyCounts).length,
      maxDepth,
      totalPrimitiveValues,
      totalObjects,
      totalArrays,
      typeBreakdown,
      topArrays,
      frequentKeys,
      rootType,
    };
  } catch (err: any) {
    return { ...emptyReport, error: `Invalid JSON for profiling: ${err.message}` };
  }
}
