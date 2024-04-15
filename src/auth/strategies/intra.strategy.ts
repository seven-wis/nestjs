import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { ConfigService } from '@nestjs/config';
import { AuthUserTdo } from 'src/utils/dto';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('INTRA_APP_ID'),
            clientSecret: configService.get<string>('INTRA_APP_SECRET'),
            callbackURL: configService.get<string>('INTRA_REDIRECT_URI'),
            Scope: ["profile"]
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
        const user : AuthUserTdo = {
            AccessToken   : accessToken,
            Id             : profile.id,
            Username            : profile.username,
            Email               : profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            Image          : profile._json.image.link,
            FirstName    : profile.name.familyName,
            LastName     : profile.name.givenName
        };

        return done(null, user);
    }
}