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

export function cancelWorkerTask(id: string): void {
  if (pendingCallbacks.has(id)) {
    pendingCallbacks.delete(id);
  }
}

export function runWorkerTask(
  request: Omit<WorkerMessageRequest, 'id'>,
  timeoutMs: number = 15000
): Promise<WorkerMessageResponse> {
  return new Promise((resolve) => {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const worker = getWorker();

    let timer: any = null;

    if (worker) {
      timer = setTimeout(() => {
        if (pendingCallbacks.has(id)) {
          pendingCallbacks.delete(id);
          resolve({
            id,
            success: false,
            error: `Processing timed out after ${timeoutMs / 1000}s`,
          });
        }
      }, timeoutMs);

      pendingCallbacks.set(id, (response) => {
        if (timer) clearTimeout(timer);
        resolve(response);
      });

      worker.postMessage({ ...request, id });
    } else {
      // Synchronous main-thread fallback
      resolve({
        id,
        success: false,
        error: 'Web Workers unavailable, falling back to main thread',
      });
    }
  });
}
