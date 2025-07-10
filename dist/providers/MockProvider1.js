"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider1 = void 0;
class MockProvider1 {
    constructor() {
        this.name = 'MockProvider1';
        this.failureRate = 0.3; // 30% failure rate
        this.isDown = false;
    }
    async sendEmail(email) {
        // Simulate network delay
        await this.delay(100 + Math.random() * 200);
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
exports.MockProvider1 = MockProvider1;
//# sourceMappingURL=MockProvider1.js.map