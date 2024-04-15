import { Controller, Get, HttpException, HttpStatus, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntraService } from './intra.service';
import { NotLoggedInUser, AlreadyLoggedInGuard } from 'src/utils/guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthUserTdo, userInfo } from 'src/utils/dto';
import { CurrentUser } from 'src/utils/decorator/userInfo.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class IntraController {
    constructor(
        private readonly configService: ConfigService,
        private readonly intraService: IntraService,
    ) { }

    @UseGuards(NotLoggedInUser, AuthGuard('42'))
    @Get("42")
    async IntraLogin() {
        const res = this.configService.get<string>('INTRA_REDIRECT_URI');
        const resp = await this.intraService.IntraLogin()
        return ("42 intra login");
    }

    @Get("42/callback")
    @UseGuards(NotLoggedInUser, AuthGuard('42'))
    async intacallback(@Req() req: any, @Res() res: any) {
        const jwtToekn = await this.intraService.intaCallback(req.user);
        res.cookie('user_token', jwtToekn, {
            expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
            httpOnly: true,
        });
        res.redirect(`${this.configService.get<string>('FRONTEND_URL')}`);
    }

    @UseGuards(AlreadyLoggedInGuard)
    @Get("logout")
    async logout(@CurrentUser() Currentuser: userInfo, @Req() req: any, @Res() res: any) {
        res.clearCookie('user_token');
        res.clearCookie('jwt');
        await this.intraService.userLogout(Currentuser.sub);
        res.send('logout done');
    }

    @UseGuards(AlreadyLoggedInGuard)
    @Get("isloggedin")
    isloggedin(@CurrentUser() Currentuser) {
        if (Currentuser._auth == null || Currentuser._auth == true) {
            throw new HttpException({
                statusCode: HttpStatus.OK
            }, HttpStatus.OK);
        }

        if (Currentuser._auth == false) {
            throw new HttpException({
                statusCode: HttpStatus.UNAUTHORIZED,
            }, HttpStatus.UNAUTHORIZED);
        }
    }
}

@Controller("")
export class HomeController {
    constructor(
        private readonly configService: ConfigService,
        private readonly intraService: IntraService,
    ) { }

    @UseGuards(AlreadyLoggedInGuard)
    @Get("home")
    async home(@CurrentUser() user) {
        return user;
        // return ("home");
    }
}