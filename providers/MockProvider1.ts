import { IEmailProvider } from "./IEmailProvider";
import { Email } from "../model/Email";

export class MockProvider1 implements IEmailProvider {
  name = 'MockProvider1';
  private failureRate = 0.3; // 30% failure rate
  private isDown = false;

  async sendEmail(email: Email): Promise<boolean> {
    // Simulate network delay
    await this.delay(100 + Math.random() * 200);
    
    // Simulate random failures
    if (Math.random() < this.failureRate || this.isDown) {
      throw new Error(`${this.name}: Failed to send email`);
    }
    
    return true;
  }

  isHealthy(): boolean {
    return !this.isDown;
    }
     // Test methods
  setDown(down: boolean) {
    this.isDown = down;
  }

  setFailureRate(rate: number) {
    this.failureRate = rate;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}