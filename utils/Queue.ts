import { Logger } from "../utils/Logger";
import { Email } from "../model/Email";

export class EmailQueue {
  private queue: Email[] = [];
  private processing = false;

  constructor(private processFunction: (email: Email) => Promise<void>) {}

  enqueue(email: Email): void {
    this.queue.push(email);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift()!;
      try {
        await this.processFunction(email);
      } catch (error) {
        Logger.error(`Failed to process email ${email.id}`, error);
      }
    }

    this.processing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}
