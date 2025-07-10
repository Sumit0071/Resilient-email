import { Email } from "../model/Email";
import { IEmailProvider } from "./IEmailProvider";

export class MockProvider2 implements IEmailProvider {
  name = 'MockProvider2';
  private failureRate = 0.2; // 20% failure rate
  private isDown = false;

  async sendEmail(email: Email): Promise<boolean> {
    // Simulate network delay
    await this.delay(150 + Math.random() * 250);
    
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