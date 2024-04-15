import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';
import { AuthUserTdo } from 'src/utils/dto';
export declare class GithubService {
    private jwtService;
    private usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    githubCallback(UserAuthInfo: AuthUserTdo): Promise<string>;
}
