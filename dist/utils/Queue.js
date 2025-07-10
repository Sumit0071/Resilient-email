"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailQueue = void 0;
const Logger_1 = require("../utils/Logger");
class EmailQueue {
    constructor(processFunction) {
        this.processFunction = processFunction;
        this.queue = [];
        this.processing = false;
    }
    enqueue(email) {
        this.queue.push(email);
        this.processQueue();
    }
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        while (this.queue.length > 0) {
            const email = this.queue.shift();
            try {
                await this.processFunction(email);
            }
            catch (error) {
                Logger_1.Logger.error(`Failed to process email ${email.id}`, error);
            }
        }
        this.processing = false;
    }
    getQueueSize() {
        return this.queue.length;
    }
}
exports.EmailQueue = EmailQueue;
//# sourceMappingURL=Queue.js.map