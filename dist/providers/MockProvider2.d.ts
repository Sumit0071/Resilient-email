import { Email } from "../model/Email";
import { IEmailProvider } from "./IEmailProvider";
export declare class MockProvider2 implements IEmailProvider {
    name: string;
    private failureRate;
    private isDown;
    sendEmail(email: Email): Promise<boolean>;
    isHealthy(): boolean;
    setDown(down: boolean): void;
    setFailureRate(rate: number): void;
    private delay;
}
//# sourceMappingURL=MockProvider2.d.ts.map