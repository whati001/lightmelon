import { ReportOutputs } from './appConfig';

export interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

export type ReportTask = {
  name: string,
  url: string,
  auth?: string,
  outputs: ReportOutputs
}