export declare class CircuitBreaker {
    private failureThreshold;
    private timeout;
    private failureCount;
    private lastFailureTime;
    private state;
    constructor(failureThreshold?: number, timeout?: number);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private shouldAttemptReset;
    getState(): string;
}
//# sourceMappingURL=CircuitBreaker.d.ts.map