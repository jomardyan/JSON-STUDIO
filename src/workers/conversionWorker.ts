import {
  ConversionTaskRequest,
  ConversionTaskResult,
  executeConversionTask,
} from '../utils/conversionTask';

export type WorkerMessageRequest =
  | ConversionTaskRequest
  | {
      id: string;
      type: 'cancel';
    };

export type WorkerMessageResponse =
  | {
      id: string;
      status: 'progress';
      progress: number;
    }
  | (ConversionTaskResult & {
      status: 'complete';
    });

const cancelledTasks = new Set<string>();

self.onmessage = (event: MessageEvent<WorkerMessageRequest>) => {
  const request = event.data;

  if (request.type === 'cancel') {
    cancelledTasks.add(request.id);
    return;
  }

  if (cancelledTasks.delete(request.id)) return;

  self.postMessage({
    id: request.id,
    status: 'progress',
    progress: 0,
  } satisfies WorkerMessageResponse);

  const result = executeConversionTask(request);
  if (cancelledTasks.delete(request.id)) return;

  self.postMessage({
    ...result,
    status: 'complete',
  } satisfies WorkerMessageResponse);
};
