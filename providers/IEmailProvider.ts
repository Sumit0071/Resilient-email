import { Email } from "../model/Email";
export interface IEmailProvider {
  name: string;
  sendEmail(email: Email): Promise<boolean>;
  isHealthy(): boolean;
}