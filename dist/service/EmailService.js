"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const Logger_1 = require("../utils/Logger");
const Email_1 = require("../model/Email");
const Queue_1 = require("../utils/Queue");
const CircuitBreaker_1 = require("./CircuitBreaker");
const RateLimiter_1 = require("./RateLimiter");
class EmailService {
    constructor(providers, maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.currentProviderIndex = 0;
        this.providers = providers;
        this.circuitBreakers = new Map();
        this.rateLimiter = new RateLimiter_1.RateLimiter();
        this.emailAttempts = new Map();
        // Initialize circuit breakers for each provider
        providers.forEach(provider => {
            this.circuitBreakers.set(provider.name, new CircuitBreaker_1.CircuitBreaker());
        });
        // Initialize email queue
        this.emailQueue = new Queue_1.EmailQueue(this.processEmailFromQueue.bind(this));
    }
    async sendEmail(email) {
        // Check for idempotency
        if (this.emailAttempts.has(email.id)) {
            const existingAttempt = this.emailAttempts.get(email.id);
            if (existingAttempt.status === Email_1.EmailStatus.SENT) {
                Logger_1.Logger.info(`Email ${email.id} already sent, skipping`);
                return existingAttempt;
            }
        }
        // Initialize email attempt
        const attempt = {
            id: email.id,
            email,
            status: Email_1.EmailStatus.PENDING,
            attempts: 0,
            lastAttempt: new Date()
        };
        this.emailAttempts.set(email.id, attempt);
        // Add to queue for processing
        this.emailQueue.enqueue(email);
        return attempt;
    }
    async processEmailFromQueue(email) {
        await this.rateLimiter.acquire();
        const attempt = this.emailAttempts.get(email.id);
        let lastError = null;
        for (let retryCount = 0; retryCount <= this.maxRetries; retryCount++) {
            attempt.attempts = retryCount + 1;
            attempt.lastAttempt = new Date();
            attempt.status = retryCount > 0 ? Email_1.EmailStatus.RETRYING : Email_1.EmailStatus.PENDING;
            // Try all providers
            for (let i = 0; i < this.providers.length; i++) {
                const providerIndex = (this.currentProviderIndex + i) % this.providers.length;
                const provider = this.providers[providerIndex];
                const circuitBreaker = this.circuitBreakers.get(provider.name);
                try {
                    Logger_1.Logger.info(`Attempting to send email ${email.id} with ${provider.name}, attempt ${retryCount + 1}`);
                    await circuitBreaker.execute(async () => {
                        await provider.sendEmail(email);
                    });
                    // Success!
                    attempt.status = Email_1.EmailStatus.SENT;
                    attempt.provider = provider.name;
                    this.currentProviderIndex = providerIndex; // Stick with successful provider
                    Logger_1.Logger.info(`Email ${email.id} sent successfully via ${provider.name}`);
                    return;
                }
                catch (error) {
                    lastError = error;
                    Logger_1.Logger.warn(`Failed to send email ${email.id} via ${provider.name}`, error);
                    // Try next provider immediately (fallback)
                    continue;
                }
            }
            // All providers failed, wait before retry (exponential backoff)
            if (retryCount < this.maxRetries) {
                const delay = this.baseDelay * Math.pow(2, retryCount);
                Logger_1.Logger.info(`All providers failed, waiting ${delay}ms before retry ${retryCount + 2}`);
                await this.delay(delay);
            }
        }
        // All retries exhausted
        attempt.status = Email_1.EmailStatus.FAILED;
        attempt.error = lastError?.message || 'Unknown error';
        Logger_1.Logger.error(`Failed to send email ${email.id} after ${this.maxRetries + 1} attempts`);
    }
    getEmailStatus(emailId) {
        return this.emailAttempts.get(emailId) || null;
    }
    getProviderStats() {
        return this.providers.map(provider => ({
            name: provider.name,
            healthy: provider.isHealthy(),
            circuitState: this.circuitBreakers.get(provider.name)?.getState()
        }));
    }
    getRateLimitStats() {
        return {
            requestCount: this.rateLimiter.getRequestCount(),
            queueSize: this.emailQueue.getQueueSize()
        };
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map