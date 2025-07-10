import { Email } from "../model/Email";
export declare class EmailQueue {
    private processFunction;
    private queue;
    private processing;
    constructor(processFunction: (email: Email) => Promise<void>);
    enqueue(email: Email): void;
    private processQueue;
    getQueueSize(): number;
}
//# sourceMappingURL=Queue.d.ts.map