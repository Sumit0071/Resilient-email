import { MockProvider1 } from '../providers/MockProvider1';
import { MockProvider2 } from '../providers/MockProvider2';
import { Email } from '../model/Email';

describe('MockProvider1', () => {
  let provider: MockProvider1;

  beforeEach(() => {
    provider = new MockProvider1();
  });

  const createTestEmail = (): Email => ({
    id: 'test-email',
    to: 'test@example.com',
    from: 'sender@example.com',
    subject: 'Test Subject',
    body: 'Test Body',
    timestamp: new Date()
  });

  it('should send email successfully when healthy', async () => {
    provider.setFailureRate(0);
    
    const result = await provider.sendEmail(createTestEmail());
    
    expect(result).toBe(true);
    expect(provider.isHealthy()).toBe(true);
  });

  it('should fail to send email when failure rate is high', async () => {
    provider.setFailureRate(1); // Always fail
    
    await expect(provider.sendEmail(createTestEmail())).rejects.toThrow();
  });

  it('should be unhealthy when set down', () => {
    provider.setDown(true);
    
    expect(provider.isHealthy()).toBe(false);
  });

  it('should fail to send email when down', async () => {
    provider.setDown(true);
    
    await expect(provider.sendEmail(createTestEmail())).rejects.toThrow();
  });

  it('should have correct name', () => {
    expect(provider.name).toBe('MockProvider1');
  });
});