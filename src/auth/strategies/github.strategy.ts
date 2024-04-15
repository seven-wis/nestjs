import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { AuthUserTdo } from 'src/utils/dto';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GITHUB_REDIRECT_URI'),
            scope: ['public_profile'],
        });
    }

    async validate(accessToken: string, _refreshToken: string, profile: Profile, done: Function) {
        const user: AuthUserTdo = {
            AccessToken: accessToken,
            Id: profile.id,
            Username: profile.username,
            Email: profile.emails ? profile.emails[0].value : `${profile.username}@${profile.provider}.com`,
            Image: profile.photos ? profile.photos[0].value : null,
            FirstName: profile.displayName.split(' ')[0],
            LastName: profile.displayName.split(' ')[1],
        };
        return done(null, user);
    }
}