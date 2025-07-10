// tests/RateLimiter.test.ts
import { RateLimiter } from '../service/RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(2, 100); // 2 requests per 100ms
  });

  it('should allow requests within limit', async () => {
    const start = Date.now();
    
    await rateLimiter.acquire();
    await rateLimiter.acquire();
    
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50); // Should be immediate
    expect(rateLimiter.getRequestCount()).toBe(2);
  });

  it('should delay requests when limit exceeded', async () => {
    const start = Date.now();
    
    await rateLimiter.acquire();
    await rateLimiter.acquire();
    await rateLimiter.acquire(); // This should be delayed
    
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(80); // Should have some delay
  });

  it('should track request count correctly', async () => {
    expect(rateLimiter.getRequestCount()).toBe(0);
    
    await rateLimiter.acquire();
    expect(rateLimiter.getRequestCount()).toBe(1);
    
    await rateLimiter.acquire();
    expect(rateLimiter.getRequestCount()).toBe(2);
  });

  it('should reset count after time window', async () => {
    await rateLimiter.acquire();
    await rateLimiter.acquire();
    expect(rateLimiter.getRequestCount()).toBe(2);
    
    // Wait for window to pass
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(rateLimiter.getRequestCount()).toBe(0);
  });
});