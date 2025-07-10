"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000 // 1 minute
    ) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }
    async acquire() {
        const now = Date.now();
        // Remove old requests outside the window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = this.windowMs - (now - oldestRequest);
            if (waitTime > 0) {
                await this.delay(waitTime);
                return this.acquire();
            }
        }
        this.requests.push(now);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    getRequestCount() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return this.requests.length;
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=RateLimiter.js.map