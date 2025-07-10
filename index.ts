import { Email } from './model/Email';
import { MockProvider1 } from './providers/MockProvider1';
import { MockProvider2 } from './providers/MockProvider2';
import { EmailService } from './service/EmailService';
import  express  from 'express';
export { EmailService } from './service/EmailService';
export { MockProvider1 } from './providers/MockProvider1';
export { MockProvider2 } from './providers/MockProvider2';
export { Email, EmailStatus, EmailAttempt } from './model/Email';
export { IEmailProvider } from './providers/IEmailProvider';
export { Logger } from './utils/Logger';



const app = express();
app.use( express.json() );
app.post('/send-email', async (req, res) => {
  const { to, from, subject, body } = req.body;
  const email: Email = {
    id: `email-${Date.now()}`,
    to,
    from,
    subject,
    body,
    timestamp: new Date()
  };

  try {
    const emailService = new EmailService([new MockProvider1(), new MockProvider2()]);
    const attempt = await emailService.sendEmail(email);
    res.status(202).json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
});
// Example usage
// async function example() {
//   const provider1 = new MockProvider1();
//   const provider2 = new MockProvider2();
  
//   const emailService = new EmailService([provider1, provider2]);
  
//   const email: Email = {
//     id: 'email-123',
//     to: 'user@example.com',
//     from: 'sender@example.com',
//     subject: 'Test Email',
//     body: 'This is a test email',
//     timestamp: new Date()
//   };
  
//   try {
//     const attempt = await emailService.sendEmail(email);
//     console.log('Email queued:', attempt);
    
//     // Check status after some delay
//     setTimeout(() => {
//       const status = emailService.getEmailStatus(email.id);
//       console.log('Email status:', status);
//       console.log('Provider stats:', emailService.getProviderStats());
//       console.log('Rate limit stats:', emailService.getRateLimitStats());
//     }, 2000);
    
//   } catch (error) {
//     console.error('Failed to send email:', error);
//   }
// }

// // Uncomment to run example
// example();