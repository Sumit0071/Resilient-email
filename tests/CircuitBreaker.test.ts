import { CircuitBreaker } from '../service/CircuitBreaker';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(2, 100); // 2 failures, 100ms timeout
  });

  it('should execute function successfully when closed', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    
    const result = await circuitBreaker.execute(mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });

  it('should open circuit after threshold failures', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('failure'));
    
    // First failure
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('failure');
    expect(circuitBreaker.getState()).toBe('CLOSED');
    
    // Second failure - should open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('failure');
    expect(circuitBreaker.getState()).toBe('OPEN');
  });

  it('should reject immediately when circuit is open', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('failure'));
    
    // Trigger failures to open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    
    expect(circuitBreaker.getState()).toBe('OPEN');
    
    // Should reject immediately without calling function
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is OPEN');
    expect(mockFn).toHaveBeenCalledTimes(2); // Only called during failures, not when open
  });

  it('should transition to half-open after timeout', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('failure'));
    
    // Open the circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow();
    expect(circuitBreaker.getState()).toBe('OPEN');
    
    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Should transition to half-open and allow one attempt
    mockFn.mockResolvedValueOnce('success');
    const result = await circuitBreaker.execute(mockFn);
    
    expect(result).toBe('success');
    expect(circuitBreaker.getState()).toBe('CLOSED');
  });
});

