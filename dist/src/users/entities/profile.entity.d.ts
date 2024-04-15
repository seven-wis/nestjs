import { User } from './user.entity';
import { PlayProgress } from './playerProgress.entity';
export declare class Profile {
    id: number;
    user_email: string;
    user_avatar: string;
    user_firstName: string;
    user_lastName: string;
    user_Status: number;
    wins: number;
    loses: number;
    score: number;
    Maxscore: number;
    level: number;
    nextLevelPercent: number;
    firstlogin: boolean;
    twoFactAuth: boolean;
    twoFactSecret: string;
    BotLevel: number;
    user: User;
    Progress: PlayProgress;
}
