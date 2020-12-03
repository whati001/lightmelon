import { IQueue } from './../types/queue';
import { catQueue } from './../util/Logger';

export default class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) { }

  public enqueue(item: T): void {
    if (this.size() === this.capacity) {
      catQueue.warn('Queue has reached max capacity, job get ignored');
    }
    catQueue.info(`New task enqueue: ${JSON.stringify(item)}`);
    this.storage.push(item);
  }

  public dequeue(): T | undefined {
    const item = this.storage.shift();
    catQueue.info(`New task dequeued: ${JSON.stringify(item)}`);
    return item;
  }

  public size(): number {
    return this.storage.length;
  }
}