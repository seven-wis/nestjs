import { ConfigService } from '@nestjs/config';
import { IntraService } from './intra.service';
import { userInfo } from 'src/utils/dto';
export declare class IntraController {
    private readonly configService;
    private readonly intraService;
    constructor(configService: ConfigService, intraService: IntraService);
    IntraLogin(): Promise<string>;
    intacallback(req: any, res: any): Promise<void>;
    logout(Currentuser: userInfo, req: any, res: any): Promise<void>;
    isloggedin(Currentuser: any): void;
}
export declare class HomeController {
    private readonly configService;
    private readonly intraService;
    constructor(configService: ConfigService, intraService: IntraService);
    home(user: any): Promise<any>;
}
