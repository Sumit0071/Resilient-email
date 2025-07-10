import { EmailQueue } from '../utils/Queue';
import { Email } from '../model/Email';

describe('EmailQueue', () => {
  let queue: EmailQueue;
  let processedEmails: Email[] = [];

  beforeEach(() => {
    processedEmails = [];
    queue = new EmailQueue(async (email: Email) => {
      processedEmails.push(email);
    });
  });

  const createTestEmail = (id: string): Email => ({
    id,
    to: 'test@example.com',
    from: 'sender@example.com',
    subject: 'Test Subject',
    body: 'Test Body',
    timestamp: new Date()
  });

  it('should process emails in order', async () => {
    const email1 = createTestEmail('email1');
    const email2 = createTestEmail('email2');
    const email3 = createTestEmail('email3');
    
    queue.enqueue(email1);
    queue.enqueue(email2);
    queue.enqueue(email3);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(processedEmails).toHaveLength(3);
    expect(processedEmails[0].id).toBe('email1');
    expect(processedEmails[1].id).toBe('email2');
    expect(processedEmails[2].id).toBe('email3');
  });

  it('should track queue size correctly', () => {
    expect(queue.getQueueSize()).toBe(0);
    
    queue.enqueue(createTestEmail('email1'));
    queue.enqueue(createTestEmail('email2'));
    
    // Queue size should be 0 after processing starts
    setTimeout(() => {
      expect(queue.getQueueSize()).toBe(0);
    }, 50);
  });

  it('should handle processing errors gracefully', async () => {
    const errorQueue = new EmailQueue(async (email: Email) => {
      if (email.id === 'error-email') {
        throw new Error('Processing error');
      }
      processedEmails.push(email);
    });
    
    errorQueue.enqueue(createTestEmail('email1'));
    errorQueue.enqueue(createTestEmail('error-email'));
    errorQueue.enqueue(createTestEmail('email3'));
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(processedEmails).toHaveLength(2);
    expect(processedEmails[0].id).toBe('email1');
    expect(processedEmails[1].id).toBe('email3');
  });
});
