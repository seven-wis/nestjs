import { Injectable, Req, Res, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUserTdo, UserStatus } from 'src/utils/dto';
import { Profile, User } from 'src/users/entities';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class IntraService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService
    ) { }

    async IntraLogin() {
        return ("IntraLogin xx");
    }
    
    async intaCallback(UserAuthInfo: AuthUserTdo) {

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

        await this.usersService.update_status(payload.sub, UserStatus.Online);
        return this.jwtService.sign(payload);
    }

    async userLogout(userId) {
        await this.usersService.update_status(userId, UserStatus.Offline);
    }
}
