"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider2 = void 0;
class MockProvider2 {
    constructor() {
        this.name = 'MockProvider2';
        this.failureRate = 0.2; // 20% failure rate
        this.isDown = false;
    }
    async sendEmail(email) {
        // Simulate network delay
        await this.delay(150 + Math.random() * 250);
        // Simulate random failures
        if (Math.random() < this.failureRate || this.isDown) {
            throw new Error(`${this.name}: Failed to send email`);
        }
        return true;
    }
    isHealthy() {
        return !this.isDown;
    }
    // Test methods
    setDown(down) {
        this.isDown = down;
    }
    setFailureRate(rate) {
        this.failureRate = rate;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.MockProvider2 = MockProvider2;
//# sourceMappingURL=MockProvider2.js.map