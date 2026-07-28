import { convertFormat, ConversionWarning } from '../adapters/formatRegistry';
import { formatJson, generateJsonSchema, minifyJson, repairJson } from './jsonUtils';

export type ConversionTaskType = 'convert' | 'format' | 'minify' | 'repair' | 'schema';

export interface ConversionTaskRequest {
  id: string;
  type: ConversionTaskType;
  input: string;
  sourceFormat?: string;
  targetFormat?: string;
  indent?: number | string;
}

export interface ConversionTaskResult {
  id: string;
  success: boolean;
  result?: string;
  error?: string;
  durationMs: number;
  warnings?: ConversionWarning[];
  isLossy?: boolean;
}

export function executeConversionTask(request: ConversionTaskRequest): ConversionTaskResult {
  const { id, type, input, sourceFormat = 'json', targetFormat = 'csv', indent = 2 } = request;
  const startTime = performance.now();

  try {
    if (type === 'convert') {
      const conversion = convertFormat(input, sourceFormat, targetFormat, indent);
      return {
        id,
        success: conversion.valid,
        result: conversion.outputText,
        error: conversion.errors[0]?.message,
        durationMs: performance.now() - startTime,
        warnings: conversion.warnings,
        isLossy: conversion.isLossy,
      };
    }

    if (type === 'format') {
      const formatted = formatJson(input, indent);
      return {
        id,
        success: !formatted.error,
        result: formatted.result,
        error: formatted.error,
        durationMs: performance.now() - startTime,
      };
    }

    if (type === 'minify') {
      const minified = minifyJson(input);
      return {
        id,
        success: !minified.error,
        result: minified.result,
        error: minified.error,
        durationMs: performance.now() - startTime,
      };
    }

    if (type === 'repair') {
      const repaired = repairJson(input);
      const valid = (() => {
        try {
          JSON.parse(repaired.repaired);
          return true;
        } catch {
          return false;
        }
      })();

      return {
        id,
        success: valid,
        result: repaired.repaired,
        error: valid ? undefined : repaired.message,
        durationMs: performance.now() - startTime,
      };
    }

    const schema = generateJsonSchema(input, Number(indent) || 2);
    return {
      id,
      success: !schema.error,
      result: schema.result,
      error: schema.error,
      durationMs: performance.now() - startTime,
    };
  } catch (error: unknown) {
    return {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Conversion task failed',
      durationMs: performance.now() - startTime,
    };
  }
}
