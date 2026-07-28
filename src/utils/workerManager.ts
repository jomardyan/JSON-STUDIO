import type { ConversionTaskRequest, ConversionTaskResult } from './conversionTask';
import { executeConversionTask } from './conversionTask';
import type { WorkerMessageResponse } from '../workers/conversionWorker';

interface PendingTask {
  resolve: (response: ConversionTaskResult) => void;
  onProgress?: (progress: number) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
  abortCleanup?: () => void;
}

export interface WorkerTaskOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  onProgress?: (progress: number) => void;
}

let workerInstance: Worker | null = null;
const pendingTasks = new Map<string, PendingTask>();

function createTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function completeTask(id: string, response: ConversionTaskResult): void {
  const pending = pendingTasks.get(id);
  if (!pending) return;

  if (pending.timeoutId) clearTimeout(pending.timeoutId);
  pending.abortCleanup?.();
  pendingTasks.delete(id);
  pending.resolve(response);
}

function failAllPending(error: string): void {
  for (const [id] of pendingTasks) {
    completeTask(id, {
      id,
      success: false,
      error,
      durationMs: 0,
    });
  }
}

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof window.Worker === 'undefined') return null;

  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('../workers/conversionWorker.ts', import.meta.url), {
        type: 'module',
      });

      workerInstance.onmessage = (event: MessageEvent<WorkerMessageResponse>) => {
        const response = event.data;
        const pending = pendingTasks.get(response.id);
        if (!pending) return;

        if (response.status === 'progress') {
          pending.onProgress?.(response.progress);
          return;
        }

        pending.onProgress?.(100);
        completeTask(response.id, response);
      };

      workerInstance.onerror = () => {
        workerInstance?.terminate();
        workerInstance = null;
        failAllPending('Conversion worker stopped unexpectedly');
      };
    } catch {
      workerInstance = null;
    }
  }

  return workerInstance;
}

export function cancelWorkerTask(id: string): void {
  const worker = getWorker();
  worker?.postMessage({ id, type: 'cancel' });
  completeTask(id, {
    id,
    success: false,
    error: 'Task cancelled',
    durationMs: 0,
  });
}

export function terminateConversionWorker(): void {
  workerInstance?.terminate();
  workerInstance = null;
  failAllPending('Conversion worker terminated');
}

export function runWorkerTask(
  request: Omit<ConversionTaskRequest, 'id'>,
  options: WorkerTaskOptions = {}
): Promise<ConversionTaskResult> {
  const id = createTaskId();
  const taskRequest: ConversionTaskRequest = { ...request, id };
  const worker = getWorker();

  if (!worker) {
    if (options.signal?.aborted) {
      return Promise.resolve({ id, success: false, error: 'Task cancelled', durationMs: 0 });
    }

    options.onProgress?.(0);
    const result = executeConversionTask(taskRequest);
    options.onProgress?.(100);
    return Promise.resolve(result);
  }

  return new Promise((resolve) => {
    const pending: PendingTask = {
      resolve,
      onProgress: options.onProgress,
    };

    if (options.timeoutMs && options.timeoutMs > 0) {
      const timeoutMs = options.timeoutMs;
      pending.timeoutId = setTimeout(() => {
        worker.postMessage({ id, type: 'cancel' });
        completeTask(id, {
          id,
          success: false,
          error: `Task timed out after ${timeoutMs} ms`,
          durationMs: timeoutMs,
        });
      }, timeoutMs);
    }

    if (options.signal) {
      const handleAbort = () => cancelWorkerTask(id);
      options.signal.addEventListener('abort', handleAbort, { once: true });
      pending.abortCleanup = () => options.signal?.removeEventListener('abort', handleAbort);
    }

    pendingTasks.set(id, pending);

    if (options.signal?.aborted) {
      cancelWorkerTask(id);
      return;
    }

    worker.postMessage(taskRequest);
  });
}
