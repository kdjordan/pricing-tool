import Papa from 'papaparse';

interface WorkerMessage {
  file: File;
  startLine: number;
}

self.onmessage = function (e: MessageEvent) {
  const { file, startLine }: WorkerMessage = e.data;

  Papa.parse(file, {
    header: false,
    skipEmptyLines: true,
    worker: true,
    step(results) {
      self.postMessage({ type: 'row', row: results.data });
    },
    complete() {
      self.postMessage({ type: 'complete' });
    },
    error(error) {
      self.postMessage({ type: 'error', error });
    },
  });
};
