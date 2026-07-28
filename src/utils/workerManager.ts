import { WorkerMessageRequest, WorkerMessageResponse } from '../workers/conversionWorker';

let workerInstance: Worker | null = null;
const pendingCallbacks = new Map<string, (response: WorkerMessageResponse) => void>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || !window.Worker) return null;

  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('../workers/conversionWorker.ts', import.meta.url), {
        type: 'module',
      });

      workerInstance.onmessage = (e: MessageEvent<WorkerMessageResponse>) => {
        const cb = pendingCallbacks.get(e.data.id);
        if (cb) {
          cb(e.data);
          pendingCallbacks.delete(e.data.id);
        }
      };

      workerInstance.onerror = () => {
        workerInstance = null;
      };
    } catch {
      workerInstance = null;
    }
  }

  return workerInstance;
}

export function runWorkerTask(request: Omit<WorkerMessageRequest, 'id'>): Promise<WorkerMessageResponse> {
  return new Promise((resolve) => {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const worker = getWorker();

    if (worker) {
      pendingCallbacks.set(id, resolve);
      worker.postMessage({ ...request, id });
    } else {
      // Fallback: synchronous execution
      resolve({
        id,
        success: false,
        error: 'Web Workers unavailable, falling back to main thread',
      });
    }
  });
}
