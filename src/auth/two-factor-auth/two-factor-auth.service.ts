import { Injectable, Res } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { ProfileService } from '../../users/services/profile.service';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class TwoFactorAuthService {
    constructor(
        private readonly profileService: ProfileService,
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) { }
    async generateTwoFactorAuthenticationSecret(username: string) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(username, "42", secret);

        return {
            secret,
            otpauthUrl,
        };
    }

    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }

    async twoFactorAuthentication(current_user_id: number, @Res() response: Response) {
        const user = await this.profileService.get_user_profile(current_user_id);
        const { secret, otpauthUrl } = await this.generateTwoFactorAuthenticationSecret(user.name);
        if (secret && otpauthUrl) {
            const res = await this.profileService.add_two_factor_auth(current_user_id, secret, false);
            if (res) {
                return await this.pipeQrCodeStream(response, otpauthUrl);
            }
        }
        throw new Error('Error while enabling two factor authentication');
    }

    async enableTwoFactorAuthVerify(current_user_id: number, token: string) {
        const user = await this.usersService.user_data(current_user_id);
        const isValid = authenticator.verify({ token: token, secret: user.profile.twoFactSecret });
        console.table({
            user: user.profile.twoFactSecret,
            name: user.profile.user_firstName,
            token: token,
            isValid: isValid
        });
        if (isValid) {
            const res = await this.profileService.add_two_factor_auth(current_user_id, user.profile.twoFactSecret, true);
            if (res)
                return user;
        }
        throw new Error('Invalid token');
    }

    async disableTwoFactorAuth(current_user_id: number) {
        const res = await this.profileService.add_two_factor_auth(current_user_id, null, false);
        if (res)
            return {
                answer: true,
                message: 'Two factor authentication disabled'
            };
        throw new Error('Error while disabling two factor authentication');
    }

    async verifyTwoFactorAuth(current_user_id: number, token: string, response: any) {
        const user = await this.usersService.user_data(current_user_id);
        const isValid = authenticator.verify({ token: token, secret: user.profile.twoFactSecret });
        if (isValid) {
            const payload = {
                username: user.user_name,
                sub: user.user_id,
                _auth: true,
            };
            return this.jwtService.sign(payload);
        }
        throw new Error('Invalid token');
    }
}
