import { ProfileService } from '../../users/services/profile.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class TwoFactorAuthService {
    private readonly profileService;
    private readonly usersService;
    private jwtService;
    constructor(profileService: ProfileService, usersService: UsersService, jwtService: JwtService);
    generateTwoFactorAuthenticationSecret(username: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any>;
    twoFactorAuthentication(current_user_id: number, response: Response): Promise<any>;
    enableTwoFactorAuthVerify(current_user_id: number, token: string): Promise<import("../../users/entities").User>;
    disableTwoFactorAuth(current_user_id: number): Promise<{
        answer: boolean;
        message: string;
    }>;
    verifyTwoFactorAuth(current_user_id: number, token: string, response: any): Promise<string>;
}
