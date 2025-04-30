declare module 'utils/email' {
    export function sendEmail(to: string, subject: string, text: string): Promise<void>;
  }