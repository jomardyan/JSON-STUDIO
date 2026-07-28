import { convertFormat } from '../adapters/formatRegistry';
import { formatJson, minifyJson, repairJson, generateJsonSchema } from '../utils/jsonUtils';

export interface WorkerMessageRequest {
  id: string;
  type: 'convert' | 'format' | 'minify' | 'repair' | 'schema';
  input: string;
  sourceFormat?: string;
  targetFormat?: string;
  indent?: number | string;
}

export interface WorkerMessageResponse {
  id: string;
  success: boolean;
  result?: string;
  error?: string;
  durationMs?: number;
}

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
  const { id, type, input, sourceFormat = 'json', targetFormat = 'csv', indent = 2 } = event.data;
  const startTime = performance.now();

  try {
    if (type === 'convert') {
      const res = convertFormat(input, sourceFormat, targetFormat, indent);
      self.postMessage({
        id,
        success: res.valid,
        result: res.outputText,
        error: res.errors[0]?.message,
        durationMs: performance.now() - startTime,
      } as WorkerMessageResponse);
    } else if (type === 'format') {
      const res = formatJson(input, indent);
      self.postMessage({
        id,
        success: !res.error,
        result: res.result,
        error: res.error,
        durationMs: performance.now() - startTime,
      } as WorkerMessageResponse);
    } else if (type === 'minify') {
      const res = minifyJson(input);
      self.postMessage({
        id,
        success: !res.error,
        result: res.result,
        error: res.error,
        durationMs: performance.now() - startTime,
      } as WorkerMessageResponse);
    } else if (type === 'repair') {
      const res = repairJson(input);
      self.postMessage({
        id,
        success: res.fixed,
        result: res.repaired,
        error: res.message,
        durationMs: performance.now() - startTime,
      } as WorkerMessageResponse);
    } else if (type === 'schema') {
      const res = generateJsonSchema(input, Number(indent) || 2);
      self.postMessage({
        id,
        success: !res.error,
        result: res.result,
        error: res.error,
        durationMs: performance.now() - startTime,
      } as WorkerMessageResponse);
    }
  } catch (err: any) {
    self.postMessage({
      id,
      success: false,
      error: err.message || 'Worker processing error',
      durationMs: performance.now() - startTime,
    } as WorkerMessageResponse);
  }
};
