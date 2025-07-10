export declare class RateLimiter {
    private maxRequests;
    private windowMs;
    private requests;
    constructor(maxRequests?: number, windowMs?: number);
    acquire(): Promise<void>;
    private delay;
    getRequestCount(): number;
}
//# sourceMappingURL=RateLimiter.d.ts.map