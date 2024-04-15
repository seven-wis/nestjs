import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { authenticator } from 'otplib';
import { CurrentUser } from 'src/utils/decorator/userInfo.decorator';
import { AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';
import e from 'express';

@UseGuards(AlreadyLoggedInGuard)
@Controller('two-factor-auth')
export class TwoFactorAuthController {
    constructor(private readonly twoFactorAuthService: TwoFactorAuthService) { }

    @Get('enable')
    async enableTwoFactorAuth(@CurrentUser() CurrentUser, @Res() response: Response) {
        try {
            return await this.twoFactorAuthService.twoFactorAuthentication(CurrentUser.sub, response);
        } catch (error) {
            console.log(error);
        }
    }

    @Post('enable-verify')
    async enableTwoFactorAuthVerify(@CurrentUser() CurrentUser, @Body() body: { token: string }) {
        try {
            const token = body.token;
            const res = await this.twoFactorAuthService.enableTwoFactorAuthVerify(CurrentUser.sub, token);
            if (res) {
                return {
                    answer: true,
                    message: 'Two factor authentication enabled'
                };
            }
            throw new Error('Error while enabling two factor authentication');
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Get('disable')
    async disableTwoFactorAuth(@CurrentUser() CurrentUser) {
        try {
            const res = await this.twoFactorAuthService.disableTwoFactorAuth(CurrentUser.sub);
            if (res) {
                return res;
            }
            throw new Error('Error while disabling two factor authentication');
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

    @Post('verify')
    async verifyTwoFactorAuth(@CurrentUser() CurrentUser, @Body() body: { token: string }, @Res() response: any) {
        try {
            const token = body.token;
            const res = await this.twoFactorAuthService.verifyTwoFactorAuth(CurrentUser.sub, token, response);
            if (res) {
                // response.clearCookie('user_token');
                // response.clearCookie('jwt');

                response.cookie('user_token', res, {
                    expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
                    httpOnly: true,
                });

                response.send({
                    answer: true,
                    message: 'Two factor authentication enabled'
                });
            }
            throw new Error('Error while enabling two factor authentication');
        } catch (e) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                answer: false,
                message: e.message,
            }, HttpStatus.FORBIDDEN);
        }
    }

}
