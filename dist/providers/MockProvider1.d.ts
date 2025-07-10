import { IEmailProvider } from "./IEmailProvider";
import { Email } from "../model/Email";
export declare class MockProvider1 implements IEmailProvider {
    name: string;
    private failureRate;
    private isDown;
    sendEmail(email: Email): Promise<boolean>;
    isHealthy(): boolean;
    setDown(down: boolean): void;
    setFailureRate(rate: number): void;
    private delay;
}
//# sourceMappingURL=MockProvider1.d.ts.map