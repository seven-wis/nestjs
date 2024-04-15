import { JwtService } from '@nestjs/jwt';
import { AuthUserTdo } from 'src/utils/dto';
import { UsersService } from 'src/users/services/users.service';
export declare class IntraService {
    private jwtService;
    private usersService;
    constructor(jwtService: JwtService, usersService: UsersService);
    IntraLogin(): Promise<string>;
    intaCallback(UserAuthInfo: AuthUserTdo): Promise<string>;
    userLogout(userId: any): Promise<void>;
}
