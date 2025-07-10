export interface Email {
    id: string;
    to: string;
    from: string;
    subject: string;
    body: string;
    timestamp: Date;
}
export declare enum EmailStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed",
    RETRYING = "retrying"
}
export interface EmailAttempt {
    id: string;
    email: Email;
    status: EmailStatus;
    attempts: number;
    lastAttempt: Date;
    provider?: string;
    error?: string;
}
//# sourceMappingURL=Email.d.ts.map