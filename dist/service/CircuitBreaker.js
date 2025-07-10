"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
class CircuitBreaker {
    constructor(failureThreshold = 3, timeout = 60000 // 1 minute
    ) {
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED';
    }
    async execute(fn) {
        if (this.state === 'OPEN') {
            if (this.shouldAttemptReset()) {
                this.state = 'HALF_OPEN';
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    shouldAttemptReset() {
        return this.lastFailureTime !== null &&
            Date.now() - this.lastFailureTime >= this.timeout;
    }
    getState() {
        return this.state;
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=CircuitBreaker.js.map