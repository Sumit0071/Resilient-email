import { EmailService } from '../service/EmailService';
import { MockProvider1 } from '../providers/MockProvider1';
import { MockProvider2 } from '../providers/MockProvider2';
import { Email, EmailStatus } from '../model/Email';

describe('EmailService', () => {
  let emailService: EmailService;
  let provider1: MockProvider1;
  let provider2: MockProvider2;

  beforeEach(() => {
    provider1 = new MockProvider1();
    provider2 = new MockProvider2();
    emailService = new EmailService([provider1, provider2], 2, 100); // 2 retries, 100ms base delay
  });

  const createTestEmail = (id: string = 'test-email'): Email => ({
    id,
    to: 'test@example.com',
    from: 'sender@example.com',
    subject: 'Test Subject',
    body: 'Test Body',
    timestamp: new Date()
  });

  describe('sendEmail', () => {
    it('should send email successfully with first provider', async () => {
      const email = createTestEmail();
      provider1.setFailureRate(0); // No failures
      
      const attempt = await emailService.sendEmail(email);
      
      expect(attempt.id).toBe(email.id);
      expect(attempt.status).toBe(EmailStatus.PENDING);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = emailService.getEmailStatus(email.id);
      expect(status?.status).toBe(EmailStatus.SENT);
      expect(status?.provider).toBe('MockProvider1');
    });

    it('should fallback to second provider when first fails', async () => {
      const email = createTestEmail();
      provider1.setFailureRate(1); // Always fail
      provider2.setFailureRate(0); // Never fail
      
      await emailService.sendEmail(email);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = emailService.getEmailStatus(email.id);
      expect(status?.status).toBe(EmailStatus.SENT);
      expect(status?.provider).toBe('MockProvider2');
    });

    it('should retry with exponential backoff', async () => {
      const email = createTestEmail();
      provider1.setFailureRate(1);
      provider2.setFailureRate(1);
      
      const startTime = Date.now();
      await emailService.sendEmail(email);
      
      // Wait for all retries to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = emailService.getEmailStatus(email.id);
      expect(status?.status).toBe(EmailStatus.FAILED);
      expect(status?.attempts).toBe(3); // Initial + 2 retries
      
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(300); // Should have some delay from retries
    });

    it('should handle idempotency - prevent duplicate sends', async () => {
      const email = createTestEmail();
      provider1.setFailureRate(0);
      
      const attempt1 = await emailService.sendEmail(email);
      const attempt2 = await emailService.sendEmail(email);
      
      expect(attempt1.id).toBe(attempt2.id);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const status = emailService.getEmailStatus(email.id);
      expect(status?.attempts).toBe(1);
    });

    it('should track email attempts correctly', async () => {
      const email = createTestEmail();
      
      const attempt = await emailService.sendEmail(email);
      
      expect(attempt.email).toEqual(email);
      expect(attempt.status).toBe(EmailStatus.PENDING);
      expect(attempt.attempts).toBe(0);
      expect(attempt.lastAttempt).toBeInstanceOf(Date);
    });
  });

  describe('getEmailStatus', () => {
    it('should return null for non-existent email', () => {
      const status = emailService.getEmailStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return correct status for existing email', async () => {
      const email = createTestEmail();
      await emailService.sendEmail(email);
      
      const status = emailService.getEmailStatus(email.id);
      expect(status).not.toBeNull();
      expect(status?.id).toBe(email.id);
    });
  });

  describe('getProviderStats', () => {
    it('should return stats for all providers', () => {
      const stats = emailService.getProviderStats();
      
      expect(stats).toHaveLength(2);
      expect(stats[0].name).toBe('MockProvider1');
      expect(stats[1].name).toBe('MockProvider2');
      expect(stats[0].healthy).toBe(true);
      expect(stats[1].healthy).toBe(true);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return rate limit statistics', () => {
      const stats = emailService.getRateLimitStats();
      
      expect(stats).toHaveProperty('requestCount');
      expect(stats).toHaveProperty('queueSize');
      expect(typeof stats.requestCount).toBe('number');
      expect(typeof stats.queueSize).toBe('number');
    });
  });
});
