import { IQueue } from './../types/queue';
import { catQueue } from './../util/Logger';

/**
 * Queue class
 */
export default class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  /**
   * Queue ctor
   * @param capacity 
   */
  constructor(private capacity: number = Infinity) { }

  /**
   * Enqueue new item to the end of the queue
   * @param item to enqueue to the end
   */
  public enqueue(item: T): void {
    if (this.size() === this.capacity) {
      catQueue.warn('Queue has reached max capacity, job get ignored');
    }
    catQueue.info(`New task enqueue: ${JSON.stringify(item)}`);
    this.storage.push(item);
  }

  /**
   * Dequeue item from the front
   */
  public dequeue(): T | undefined {
    const item = this.storage.shift();
    catQueue.info(`New task dequeued: ${JSON.stringify(item)}`);
    return item;
  }

  /**
   * Clear Queue storage
   */
  public clear() {
    this.storage = [];
  }

  /**
   * Get current queue size
   */
  public size(): number {
    return this.storage.length;
  }
}