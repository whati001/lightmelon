import { AppOutputConfig, AuthConfig, PageConfig } from "./config";

export interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

export type ReportTask = {
  page: PageConfig;
  outputs: AppOutputConfig;
  auth?: AuthConfig;
};
