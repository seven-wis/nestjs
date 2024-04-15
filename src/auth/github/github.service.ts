import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Profile } from 'src/users/entities';
import { UsersService } from 'src/users/services/users.service';
import { AuthUserTdo } from 'src/utils/dto';

@Injectable()
export class GithubService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    async githubCallback(UserAuthInfo: AuthUserTdo) {
        var user_data: { user: User; profile: Profile } = await this.usersService.get_user_by_email(UserAuthInfo.Email);
        if (!user_data.user) {
            user_data.user = await this.usersService.create_new_user(UserAuthInfo);
            user_data.profile = user_data.user.profile;
        }

        const payload = {
            username: user_data.user.user_name,
            sub: user_data.user.user_id,
            _auth: user_data.profile.twoFactAuth == true ? false : null,
        };

        return this.jwtService.sign(payload);
    }
}
