"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.EmailStatus = exports.MockProvider2 = exports.MockProvider1 = exports.EmailService = void 0;
const MockProvider1_1 = require("./providers/MockProvider1");
const MockProvider2_1 = require("./providers/MockProvider2");
const EmailService_1 = require("./service/EmailService");
var EmailService_2 = require("./service/EmailService");
Object.defineProperty(exports, "EmailService", { enumerable: true, get: function () { return EmailService_2.EmailService; } });
var MockProvider1_2 = require("./providers/MockProvider1");
Object.defineProperty(exports, "MockProvider1", { enumerable: true, get: function () { return MockProvider1_2.MockProvider1; } });
var MockProvider2_2 = require("./providers/MockProvider2");
Object.defineProperty(exports, "MockProvider2", { enumerable: true, get: function () { return MockProvider2_2.MockProvider2; } });
var Email_1 = require("./model/Email");
Object.defineProperty(exports, "EmailStatus", { enumerable: true, get: function () { return Email_1.EmailStatus; } });
var Logger_1 = require("./utils/Logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return Logger_1.Logger; } });
// Example usage
async function example() {
    const provider1 = new MockProvider1_1.MockProvider1();
    const provider2 = new MockProvider2_1.MockProvider2();
    const emailService = new EmailService_1.EmailService([provider1, provider2]);
    const email = {
        id: 'email-123',
        to: 'user@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        body: 'This is a test email',
        timestamp: new Date()
    };
    try {
        const attempt = await emailService.sendEmail(email);
        console.log('Email queued:', attempt);
        // Check status after some delay
        setTimeout(() => {
            const status = emailService.getEmailStatus(email.id);
            console.log('Email status:', status);
            console.log('Provider stats:', emailService.getProviderStats());
            console.log('Rate limit stats:', emailService.getRateLimitStats());
        }, 2000);
    }
    catch (error) {
        console.error('Failed to send email:', error);
    }
}
// Uncomment to run example
example();
//# sourceMappingURL=index.js.map