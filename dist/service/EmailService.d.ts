import { EmailAttempt, Email } from "../model/Email";
import { IEmailProvider } from "../providers/IEmailProvider";
export declare class EmailService {
    private maxRetries;
    private baseDelay;
    private providers;
    private circuitBreakers;
    private rateLimiter;
    private emailQueue;
    private emailAttempts;
    private currentProviderIndex;
    constructor(providers: IEmailProvider[], maxRetries?: number, baseDelay?: number);
    sendEmail(email: Email): Promise<EmailAttempt>;
    private processEmailFromQueue;
    getEmailStatus(emailId: string): EmailAttempt | null;
    getProviderStats(): any;
    getRateLimitStats(): any;
    private delay;
}
//# sourceMappingURL=EmailService.d.ts.map