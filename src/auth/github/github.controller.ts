import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthGuard } from '@nestjs/passport';
import { NotLoggedInUser } from 'src/utils/guards/auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class GithubController {
    constructor(
        private readonly githubService: GithubService,
        private readonly configService: ConfigService,    
    ) { }

    @UseGuards(NotLoggedInUser, AuthGuard('github'))
    @Get("github")
    async githubLogin() {
        return ("github login");
    }

    @Get("github/callback")
    @UseGuards(NotLoggedInUser, AuthGuard('github'))
    async githubcallback(@Req() req: any, @Res() res: any) {
        const jwtToekn = await this.githubService.githubCallback(req.user);
        res.cookie('user_token', jwtToekn, {
            expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
            httpOnly: true,
        });
        res.redirect(`${this.configService.get<string>('FRONTEND_URL')}`);
    }
}
