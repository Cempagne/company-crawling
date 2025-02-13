declare module "email-verifier" {
    export default class Verifier {
        constructor();
        verify(email: string, callback: (err: any, data: {
            formatCheck: string;
            dnsCheck: string;
            smtpCheck: string;
            catchAllCheck: string;
        }) => void): void;
    }
}
