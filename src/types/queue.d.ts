export interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

export interface RepTask {
  url: string;
  dstDir: string;
}