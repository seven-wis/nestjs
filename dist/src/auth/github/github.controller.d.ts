import { GithubService } from './github.service';
import { ConfigService } from '@nestjs/config';
export declare class GithubController {
    private readonly githubService;
    private readonly configService;
    constructor(githubService: GithubService, configService: ConfigService);
    githubLogin(): Promise<string>;
    githubcallback(req: any, res: any): Promise<void>;
}
