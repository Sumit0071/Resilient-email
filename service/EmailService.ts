import { Logger } from "../utils/Logger";
import { EmailAttempt, Email, EmailStatus } from "../model/Email";
import { IEmailProvider } from "../providers/IEmailProvider";
import { EmailQueue } from "../utils/Queue";
import { CircuitBreaker } from "./CircuitBreaker";
import { RateLimiter } from "./RateLimiter";

export class EmailService {
  private providers: IEmailProvider[];
  private circuitBreakers: Map<string, CircuitBreaker>;
  private rateLimiter: RateLimiter;
  private emailQueue: EmailQueue;
  private emailAttempts: Map<string, EmailAttempt>;
  private currentProviderIndex = 0;

  constructor(
    providers: IEmailProvider[],
    private maxRetries: number = 3,
    private baseDelay: number = 1000
  ) {
    this.providers = providers;
    this.circuitBreakers = new Map();
    this.rateLimiter = new RateLimiter();
    this.emailAttempts = new Map();
    
    // Initialize circuit breakers for each provider
    providers.forEach(provider => {
      this.circuitBreakers.set(provider.name, new CircuitBreaker());
    });

    // Initialize email queue
    this.emailQueue = new EmailQueue(this.processEmailFromQueue.bind(this));
  }

  async sendEmail(email: Email): Promise<EmailAttempt> {
    // Check for idempotency
    if (this.emailAttempts.has(email.id)) {
      const existingAttempt = this.emailAttempts.get(email.id)!;
      if (existingAttempt.status === EmailStatus.SENT) {
        Logger.info(`Email ${email.id} already sent, skipping`);
        return existingAttempt;
      }
    }

    // Initialize email attempt
    const attempt: EmailAttempt = {
      id: email.id,
      email,
      status: EmailStatus.PENDING,
      attempts: 0,
      lastAttempt: new Date()
    };

    this.emailAttempts.set(email.id, attempt);

    // Add to queue for processing
    this.emailQueue.enqueue(email);

    return attempt;
  }

  private async processEmailFromQueue(email: Email): Promise<void> {
    await this.rateLimiter.acquire();
    
    const attempt = this.emailAttempts.get(email.id)!;
    let lastError: Error | null = null;

    for (let retryCount = 0; retryCount <= this.maxRetries; retryCount++) {
      attempt.attempts = retryCount + 1;
      attempt.lastAttempt = new Date();
      attempt.status = retryCount > 0 ? EmailStatus.RETRYING : EmailStatus.PENDING;

      // Try all providers
      for (let i = 0; i < this.providers.length; i++) {
        const providerIndex = (this.currentProviderIndex + i) % this.providers.length;
        const provider = this.providers[providerIndex];
        const circuitBreaker = this.circuitBreakers.get(provider.name)!;

        try {
          Logger.info(`Attempting to send email ${email.id} with ${provider.name}, attempt ${retryCount + 1}`);
          
          await circuitBreaker.execute(async () => {
            await provider.sendEmail(email);
          });

          // Success!
          attempt.status = EmailStatus.SENT;
          attempt.provider = provider.name;
          this.currentProviderIndex = providerIndex; // Stick with successful provider
          
          Logger.info(`Email ${email.id} sent successfully via ${provider.name}`);
          return;

        } catch (error) {
          lastError = error as Error;
          Logger.warn(`Failed to send email ${email.id} via ${provider.name}`, error);
          
          // Try next provider immediately (fallback)
          continue;
        }
      }

      // All providers failed, wait before retry (exponential backoff)
      if (retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        Logger.info(`All providers failed, waiting ${delay}ms before retry ${retryCount + 2}`);
        await this.delay(delay);
      }
    }

    // All retries exhausted
    attempt.status = EmailStatus.FAILED;
    attempt.error = lastError?.message || 'Unknown error';
    Logger.error(`Failed to send email ${email.id} after ${this.maxRetries + 1} attempts`);
  }

  getEmailStatus(emailId: string): EmailAttempt | null {
    return this.emailAttempts.get(emailId) || null;
  }

  getProviderStats(): any {
    return this.providers.map(provider => ({
      name: provider.name,
      healthy: provider.isHealthy(),
      circuitState: this.circuitBreakers.get(provider.name)?.getState()
    }));
  }

  getRateLimitStats(): any {
    return {
      requestCount: this.rateLimiter.getRequestCount(),
      queueSize: this.emailQueue.getQueueSize()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}