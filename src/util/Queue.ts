import { Logger } from "tslog";
import { IQueue } from "./../types/queue";
import { getLogger } from "./Logger";

/**
 * Queue class
 */
export default class Queue<T> implements IQueue<T> {
  private storage: T[] = [];
  private logger: Logger;

  /**
   * Queue ctor
   * @param capacity 
   */
  constructor(private capacity: number = Infinity) {
    this.logger = getLogger("Queue").unwrap();
  }

  /**
   * Enqueue new item to the end of the queue
   * @param item to enqueue to the end
   */
  public enqueue(item: T): void {
    if (this.size() === this.capacity) {
      this.logger.warn(
        "Queue has reached max capacity, skip enqueue request to avoid overloading Worker",
      );
    }
    this.logger.info("Queue has enqueued new task");
    this.storage.push(item);
  }

  /**
   * Dequeue item from the front
   */
  public dequeue(): T | undefined {
    const item = this.storage.shift();
    if (item) {
      this.logger.info("Queue has dequeued new task");
      return item;
    }

    this.logger.info("Queue is empty, nothing to dequeue");
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
