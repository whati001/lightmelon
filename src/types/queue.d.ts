import { ReportOutputs } from './config';

export interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

export interface RepTask {
  name: string,
  url: string;
  output: ReportOutputs;
}