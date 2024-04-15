import { TwoFactorAuthService } from './two-factor-auth.service';
export declare class TwoFactorAuthController {
    private readonly twoFactorAuthService;
    constructor(twoFactorAuthService: TwoFactorAuthService);
    enableTwoFactorAuth(CurrentUser: any, response: Response): Promise<any>;
    enableTwoFactorAuthVerify(CurrentUser: any, body: {
        token: string;
    }): Promise<{
        answer: boolean;
        message: string;
    }>;
    disableTwoFactorAuth(CurrentUser: any): Promise<{
        answer: boolean;
        message: string;
    }>;
    verifyTwoFactorAuth(CurrentUser: any, body: {
        token: string;
    }, response: any): Promise<void>;
}
